import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecs from 'aws-cdk-lib/aws-ecs';

export interface PipelineStackProps extends cdk.StackProps {
  ecrRepository: ecr.Repository;
  ecsCluster: string;
  ecsService: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  githubTokenSecretName: string;
}

export class OvertimePipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    // Pipeline artifact bucket
    const artifactBucket = new cdk.aws_s3.Bucket(this, 'ArtifactBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
    });

    // CodeBuild role
    const codeBuildRole = new iam.Role(this, 'CodeBuildRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
      ],
    });

    // Add S3 permissions to CodeBuild role
    codeBuildRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        's3:GetObject*',
        's3:GetBucket*',
        's3:List*',
        's3:PutObject*',
        's3:DeleteObject*',
      ],
      resources: [
        artifactBucket.bucketArn,
        `${artifactBucket.bucketArn}/*`,
      ],
    }));

    // CodeBuild project
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      role: codeBuildRole,
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
        privileged: true, // Required for Docker commands
      },
      environmentVariables: {
        ECR_REPOSITORY_URI: {
          value: props.ecrRepository.repositoryUri,
        },
        AWS_ACCOUNT_ID: {
          value: this.account,
        },
        AWS_REGION: {
          value: this.region,
        },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'echo Logging in to Amazon ECR...',
              'aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com',
              'COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)',
              'IMAGE_TAG=${COMMIT_HASH:=latest}',
            ],
          },
          build: {
            commands: [
              'echo Building the Docker image...',
              'docker build -t $ECR_REPOSITORY_URI:$IMAGE_TAG .',
              'docker tag $ECR_REPOSITORY_URI:$IMAGE_TAG $ECR_REPOSITORY_URI:latest',
            ],
          },
          post_build: {
            commands: [
              'echo Pushing the Docker image...',
              'docker push $ECR_REPOSITORY_URI:$IMAGE_TAG',
              'docker push $ECR_REPOSITORY_URI:latest',
              'echo Writing image definitions file...',
              'echo "[{\\"name\\":\\"overtime-ote-player-summaries\\",\\"imageUri\\":\\"$ECR_REPOSITORY_URI:$IMAGE_TAG\\"}]" > imagedefinitions.json',
            ],
          },
        },
        artifacts: {
          files: [
            'imagedefinitions.json',
          ],
        },
      }),
    });

    // CodePipeline role
    const pipelineRole = new iam.Role(this, 'CodePipelineRole', {
      assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com'),
    });

    // Add permissions to pipeline role
    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        's3:GetObject*',
        's3:GetBucket*',
        's3:List*',
        's3:PutObject*',
        's3:DeleteObject*',
      ],
      resources: [
        artifactBucket.bucketArn,
        `${artifactBucket.bucketArn}/*`,
      ],
    }));

    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'codebuild:StartBuild',
        'codebuild:BatchGetBuilds',
      ],
      resources: [buildProject.projectArn],
    }));

    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ecs:DescribeServices',
        'ecs:DescribeTaskDefinition',
        'ecs:DescribeTasks',
        'ecs:ListTasks',
        'ecs:RegisterTaskDefinition',
        'ecs:UpdateService',
      ],
      resources: ['*'],
    }));

    pipelineRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'iam:PassRole',
      ],
      resources: ['*'],
      conditions: {
        StringEqualsIfExists: {
          'iam:PassedToService': [
            'ecs-tasks.amazonaws.com',
          ],
        },
      },
    }));

    // Pipeline
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      role: pipelineRole,
      artifactBucket: artifactBucket,
      pipelineName: 'overtime-ote-player-summaries-pipeline',
    });

    // Source stage
    const sourceOutput = new codepipeline.Artifact('SourceCode');
    
    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: props.githubOwner,
      repo: props.githubRepo,
      branch: props.githubBranch,
      oauthToken: cdk.SecretValue.secretsManager(props.githubTokenSecretName),
      output: sourceOutput,
      trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });

    // Build stage
    const buildOutput = new codepipeline.Artifact('BuildOutput');
    
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'BuildAndPushImage',
      project: buildProject,
      input: sourceOutput,
      outputs: [buildOutput],
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [buildAction],
    });

    // Deploy stage
    const deployAction = new codepipeline_actions.EcsDeployAction({
      actionName: 'DeployToECS',
      service: ecs.FargateService.fromFargateServiceAttributes(this, 'ImportedService', {
        serviceArn: `arn:aws:ecs:${this.region}:${this.account}:service/${props.ecsCluster}/${props.ecsService}`,
        cluster: ecs.Cluster.fromClusterArn(
          this,
          'ImportedCluster',
          `arn:aws:ecs:${this.region}:${this.account}:cluster/${props.ecsCluster}`
        ),
      }),
      input: buildOutput,
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [deployAction],
    });

    // Outputs
    new cdk.CfnOutput(this, 'PipelineUrl', {
      value: `https://${this.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline.pipelineName}/view`,
      description: 'URL to the CodePipeline console',
    });
  }
}