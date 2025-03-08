import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elasticloadbalancingv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class OvertimeOtePlayerSummariesStack extends cdk.Stack {
  public readonly ecrRepository: ecr.Repository;
  public readonly fargateService: ecs.FargateService;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use VPC from ID instead of lookup to avoid AWS API calls during synth
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ExistingVPC', {
      vpcId: 'vpc-03ebdba3b7fb3c00f',
      availabilityZones: ['us-east-1a', 'us-east-1b'],
      publicSubnetIds: ['subnet-0d4eb4c019ed1991d', 'subnet-08f3f862d2ed8c20c']
    });

    // Import existing security group
    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'ServiceSecurityGroup', 'sg-0ca5d85cbc46902fa');

    // Create or import ECS cluster
    const cluster = ecs.Cluster.fromClusterAttributes(this, 'ExistingCluster', {
      clusterName: 'overtime-cluster',
      vpc,
      securityGroups: []
    });

    // Try to import existing ECR repository, create if it doesn't exist
    try {
      this.ecrRepository = ecr.Repository.fromRepositoryName(
        this,
        'Repository',
        'overtime-ote-player-summaries'
      ) as ecr.Repository;
    } catch (e) {
      this.ecrRepository = new ecr.Repository(this, 'Repository', {
        repositoryName: 'overtime-ote-player-summaries',
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      });
    }

    // Try to import existing execution role, create if it doesn't exist
    let executionRole: iam.Role;
    try {
      const importedRole = iam.Role.fromRoleName(
        this,
        'TaskExecutionRole',
        'EcsTaskExecutionRole'
      );
      // Create a new role with a different name to avoid conflicts
      executionRole = new iam.Role(this, 'TaskExecutionRoleNew', {
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        roleName: 'EcsTaskExecutionRole-new'
      });
    } catch (e) {
      executionRole = new iam.Role(this, 'TaskExecutionRoleNew', {
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        roleName: 'EcsTaskExecutionRole'
      });
    }
    
    // Add required policies
    executionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'));
    executionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryPullOnly'));
    executionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerServiceRole'));
    executionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'));
    executionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonECS_FullAccess'));

    // Try to import existing task role, create if it doesn't exist
    let taskRole: iam.Role;
    try {
      const importedRole = iam.Role.fromRoleName(
        this,
        'TaskRole',
        'ecsTaskRole'
      );
      // Create a new role with the same name if we need to modify it
      taskRole = new iam.Role(this, 'TaskRoleNew', {
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        roleName: 'ecsTaskRole-new'
      });
    } catch (e) {
      taskRole = new iam.Role(this, 'TaskRoleNew', {
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        roleName: 'ecsTaskRole'
      });
    }
    
    // Add SSM parameter read permissions
    taskRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ssm:GetParameters',
        'ssm:GetParameter'
      ],
      resources: [
        `arn:aws:ssm:${this.region}:${this.account}:parameter/overtime/*`
      ]
    }));

    // Try to import existing log group, create if it doesn't exist
    let logGroup: logs.ILogGroup;
    try {
      logGroup = logs.LogGroup.fromLogGroupName(
        this,
        'ServiceLogGroup',
        '/ecs/overtime-ote-player-summaries'
      );
    } catch (e) {
      logGroup = new logs.LogGroup(this, 'ServiceLogGroupNew', {
        logGroupName: '/ecs/overtime-ote-player-summaries',
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        retention: logs.RetentionDays.ONE_MONTH
      });
    }

    // Create task definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      family: 'overtime-ote-player-summaries',
      executionRole,
      taskRole,
      cpu: 256,
      memoryLimitMiB: 512,
    });

    // Add container to task definition
    const container = taskDefinition.addContainer('AppContainer', {
      containerName: 'overtime-ote-player-summaries',
      image: ecs.ContainerImage.fromEcrRepository(this.ecrRepository),
      essential: true,
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'ecs',
        logGroup
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '80'
      },
      secrets: {
        ENCRYPTION_KEY: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'EncryptionKeyParam', {
            parameterName: '/overtime/ENCRYPTION_KEY',
            version: 1
          })
        ),
        SALT: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'SaltParam', {
            parameterName: '/overtime/SALT',
            version: 1
          })
        ),
        OPEN_API_KEY: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'OpenApiKeyParam', {
            parameterName: '/overtime/OPEN_API_KEY',
            version: 1
          })
        ),
        DB_PASS: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'DbPassParam', {
            parameterName: '/overtime/DB_PASS',
            version: 1
          })
        ),
        DB_NAME: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'DbNameParam', {
            parameterName: '/overtime/DB_NAME',
            version: 1
          })
        ),
        HEALTH_CHECK: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'HealthCheckParam', {
            parameterName: '/overtime/HEALTH_CHECK',
            version: 1
          })
        ),
        TWILIO_ACCOUNT_SID: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'TwilioAccountSidParam', {
            parameterName: '/overtime/TWILIO_ACCOUNT_SID',
            version: 1
          })        
        ),
        TWILIO_AUTH_TOKEN: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'TwilioAuthTokenParam', {
            parameterName: '/overtime/TWILIO_AUTH_TOKEN',
            version: 1
          })        
        ),
        API_KEY: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'ApiKeyParam', {
            parameterName: '/overtime/API_KEY',
            version: 1
          })        
        ),
        SMS_URL: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'SmsUrlParam', {
            parameterName: '/overtime/SMS_URL',
            version: 1
          })        
        ),
        ANALYSIS_URL: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'AnalysisUrlParam', {
            parameterName: '/overtime/ANALYSIS_URL',
            version: 1
          })        
        ),                                
      }
    });

    // Add port mapping
    container.addPortMappings({
      containerPort: 80,
      hostPort: 80,
      protocol: ecs.Protocol.TCP
    });

    // Import existing load balancer using ARN directly instead of lookup
    const loadBalancer = elasticloadbalancingv2.ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(this, 'ExistingALB', {
      loadBalancerArn: 'arn:aws:elasticloadbalancing:us-east-1:443370689229:loadbalancer/app/overtime-alb/cc344f6845c89b93',
      securityGroupId: 'sg-0ca5d85cbc46902fa', // Use the same security group ID as the service
      loadBalancerDnsName: 'overtime-alb-123456789.us-east-1.elb.amazonaws.com', // Replace with actual DNS name if known      
      vpc      
    });

    // Create or import target group
    let targetGroup: elasticloadbalancingv2.ApplicationTargetGroup;
    const targetGroupName = 'overtime-tg-80';
    
    try {
      // First try to import existing target group
      targetGroup = elasticloadbalancingv2.ApplicationTargetGroup.fromTargetGroupAttributes(
        this,
        'ExistingTargetGroup',
        {
          targetGroupArn: `arn:aws:elasticloadbalancing:${this.region}:${this.account}:targetgroup/${targetGroupName}/\*`,
          loadBalancerArns: loadBalancer.loadBalancerArn,
        }
      ) as any;
    } catch (error) {
      // If import fails, create new target group
      targetGroup = new elasticloadbalancingv2.ApplicationTargetGroup(this, 'ServiceTargetGroup', {
        vpc,
        port: 80,
        protocol: elasticloadbalancingv2.ApplicationProtocol.HTTP,
        targetType: elasticloadbalancingv2.TargetType.IP,
        healthCheck: {
          path: '/health',
          interval: cdk.Duration.seconds(10),
          timeout: cdk.Duration.seconds(5),
          healthyThresholdCount: 2,
          unhealthyThresholdCount: 2,
          healthyHttpCodes: '200'          
        },        
        targetGroupName: targetGroupName        
      });
    
      // Add tags to new target group
      cdk.Tags.of(targetGroup).add('Name', targetGroupName);
      cdk.Tags.of(targetGroup).add('Environment', props?.env?.region || 'development');
    }
    
    // Ensure targetGroup is defined before proceeding
    if (!targetGroup) {
      throw new Error('Failed to create or import target group');
    }
    

    // Import existing listener using attributes instead of lookup
    const listener = elasticloadbalancingv2.ApplicationListener.fromApplicationListenerAttributes(this, '325862f23e77bd75', {
      listenerArn: 'arn:aws:elasticloadbalancing:us-east-1:443370689229:listener/app/overtime-alb/cc344f6845c89b93/325862f23e77bd75',
      securityGroup: securityGroup
    });

    // Try to create listener rule with a unique ID to avoid conflicts
    try {      
      const ruleId = '444800402b109686';
      new elasticloadbalancingv2.ApplicationListenerRule(this, ruleId, {
        listener: listener,
        priority: 100, // Adjust priority as needed
        conditions: [
          elasticloadbalancingv2.ListenerCondition.pathPatterns(['/ote-player-summaries/*']), // Adjust path pattern as needed
        ],
        targetGroups: [targetGroup]
      });
    } catch (e) {
      console.log('Listener rule may already exist, skipping creation');
    }

    // Try to import existing Fargate service, create if it doesn't exist
    try {
      this.fargateService = ecs.FargateService.fromFargateServiceAttributes(
        this,
        'ExistingService',
        {
          serviceName: 'overtime-ote-player-summaries-80',
          cluster
        }
      ) as ecs.FargateService;
    } catch (e) {
      // Create Fargate service
      this.fargateService = new ecs.FargateService(this, 'Service', {
        cluster,
        taskDefinition,
        desiredCount: 1,
        serviceName: 'overtime-ote-player-summaries-80',
        assignPublicIp: true,
        securityGroups: [securityGroup],
        vpcSubnets: {
          subnets: [
            ec2.Subnet.fromSubnetId(this, 'Subnet1', 'subnet-0d4eb4c019ed1991d'),
            ec2.Subnet.fromSubnetId(this, 'Subnet2', 'subnet-08f3f862d2ed8c20c')
          ]
        }
      });

      // Attach service to target group
      this.fargateService.attachToApplicationTargetGroup(targetGroup);
    }

    // Output the service URL
    new cdk.CfnOutput(this, 'ServiceURL', {
      value: `http://${loadBalancer.loadBalancerDnsName}`
    });

    // Output the ECR repository URI
    new cdk.CfnOutput(this, 'RepositoryURI', {
      value: this.ecrRepository.repositoryUri
    });
  }
}