import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as efs from 'aws-cdk-lib/aws-efs';

export class MongoDBStack extends cdk.Stack {
  public readonly mongoService: ecs.FargateService;
  public readonly mongoEndpoint: string;
  public readonly ecrRepository: ecr.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use VPC from ID instead of lookup to avoid AWS API calls during synth
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ExistingVPC', {
      vpcId: 'vpc-03ebdba3b7fb3c00f',
      availabilityZones: ['us-east-1a', 'us-east-1b'],
      publicSubnetIds: ['subnet-0d4eb4c019ed1991d', 'subnet-08f3f862d2ed8c20c']
    });

    // Create a security group for MongoDB
    const mongoSecurityGroup = new ec2.SecurityGroup(this, 'MongoDBSecurityGroup', {
      vpc,
      description: 'Security group for MongoDB container',
      allowAllOutbound: true,      
    });

    // Create or import ECS cluster
    const cluster = ecs.Cluster.fromClusterAttributes(this, 'ExistingCluster', {
      clusterName: 'overtime-cluster',
      vpc,
      securityGroups: []
    });

    // Create execution role for MongoDB task
    const executionRole = new iam.Role(this, 'MongoExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      roleName: 'MongoDBExecutionRole'
    });

    const taskRole = new iam.Role(this, 'MongoTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      roleName: 'MongoDBTaskRole'
    });
    
    // Add required policies
    executionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'));
    executionRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'));

    // Create log group for MongoDB
    const logGroup = new logs.LogGroup(this, 'MongoDBLogGroup', {
      logGroupName: '/ecs/mongodb',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_MONTH
    });

    // Create a security group for EFS
    const efsSecurityGroup = new ec2.SecurityGroup(this, 'EfsSecurityGroup', {
      vpc,
      description: 'Security group for MongoDB EFS',
      allowAllOutbound: true,      
    });

    efsSecurityGroup.addIngressRule(
      ec2.Peer.securityGroupId(mongoSecurityGroup.securityGroupId), // App security group ID
      ec2.Port.tcp(2049),
      'Allow MongoDB access to efs'
    );

    mongoSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), // anyone in our group
      ec2.Port.tcpRange(2049,27017),
      'Allow MongoDB access from all the things'
    );
    
    // Create EFS File System
    const fileSystem = new efs.FileSystem(this, 'MongoDBFileSystem', {
      vpc,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING,
      securityGroup: efsSecurityGroup,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      allowAnonymousAccess: true,            
      vpcSubnets: {
        subnets: [
          ec2.Subnet.fromSubnetId(this, 'EfsSubnet1', 'subnet-0d4eb4c019ed1991d'),
          ec2.Subnet.fromSubnetId(this, 'EfsSubnet2', 'subnet-08f3f862d2ed8c20c')
        ],        
      }
    });
    
    // Create EFS Access Point
    const accessPoint = new efs.AccessPoint(this, 'MongoDBAccessPoint', {
      fileSystem,
      path: '/mongodb',      
      createAcl: {
        ownerGid: '999',
        ownerUid: '999',
        permissions: '755'
      },   
    });
    
    // Grant task role access to EFS
    fileSystem.grantRootAccess(taskRole);
    // fileSystem.connections.allowDefaultPortFromAnyIpv4();
    // fileSystem.connections.allowFrom(ec2.Peer.securityGroupId(mongoSecurityGroup.securityGroupId), ec2.Port.tcp(2049), 'Allow MongoDB access from application');
    
    // Create a volume for MongoDB data persistence
    const mongoVolumeName = 'mongodb';

    // Create task definition for MongoDB
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'MongoDBTaskDefinition', {
      family: 'mongodb',
      executionRole,
      taskRole,
      cpu: 512,
      memoryLimitMiB: 1024,      
      volumes: [
        {
          name: mongoVolumeName,
          efsVolumeConfiguration: {                        
            fileSystemId: fileSystem.fileSystemId,
            rootDirectory: '/',
            transitEncryption: 'ENABLED',
            transitEncryptionPort: 2049,
            authorizationConfig: {
              accessPointId: accessPoint.accessPointId,            
              iam: 'ENABLED',
            }                        
          },          
        }
      ]
    });

    // Get MongoDB credentials from SSM Parameter Store
    const mongoUsername = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'MongoUsernameParam', {
      parameterName: '/overtime/MONGO_USERNAME',
      version: 1
    });

    const mongoPassword = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'MongoPasswordParam', {
      parameterName: '/overtime/MONGO_PASSWORD',
      version: 1
    });

    const mongoDbName = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'MongoDbNameParam', {
      parameterName: '/overtime/DB_NAME',
      version: 1
    });

    try {
      this.ecrRepository = ecr.Repository.fromRepositoryName(
        this, 
        'MongoDBRepository', 
        'mongodb-botocore',
       ) as ecr.Repository;
    } catch (error) {
      this.ecrRepository = new ecr.Repository(this, 'MongoDBRepository', {
        repositoryName: 'mongodb-botocore',
        removalPolicy: cdk.RemovalPolicy.RETAIN
      });
    }

    // Add MongoDB container to task definition
    const container = taskDefinition.addContainer('MongoDBContainer', {
      containerName: 'mongodb-botocore',
      image: ecs.ContainerImage.fromEcrRepository(this.ecrRepository, '6.0'),
      essential: true,
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'mongodb',
        logGroup
      }),
      environment: {
        MONGO_INITDB_DATABASE: 'admin'
      },
      secrets: {
        MONGO_INITDB_ROOT_USERNAME: ecs.Secret.fromSsmParameter(mongoUsername),
        MONGO_INITDB_ROOT_PASSWORD: ecs.Secret.fromSsmParameter(mongoPassword)
      },      
      portMappings: [
        {
          containerPort: 27017,
          hostPort: 27017,
          protocol: ecs.Protocol.TCP
        },
        {
          containerPort: 27018,
          hostPort: 27018,
          protocol: ecs.Protocol.TCP
        },
        {
          containerPort: 27019,
          hostPort: 27019,
          protocol: ecs.Protocol.TCP
        },
      ],
      healthCheck: {
        command: [
          'CMD-SHELL',
          'echo "db.runCommand({ping: 1})" | mongosh --quiet'
        ],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60)
      },      
    });

    // Mount the volume to the container
    container.addMountPoints({
      containerPath: '/mongodb',
      sourceVolume: mongoVolumeName,
      readOnly: false      
    });

    // Create Fargate service for MongoDB
    this.mongoService = new ecs.FargateService(this, 'MongoDBService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      serviceName: 'mongodb',
      assignPublicIp: true,
      securityGroups: [mongoSecurityGroup],
      vpcSubnets: {
        subnets: [
          ec2.Subnet.fromSubnetId(this, 'Subnet1', 'subnet-0d4eb4c019ed1991d'),
          ec2.Subnet.fromSubnetId(this, 'Subnet2', 'subnet-08f3f862d2ed8c20c')
        ]
      }
    });

    // Store the MongoDB connection string in SSM Parameter Store
    let mongoConnectionString = new ssm.StringParameter(this, 'MongoConnectionString', {
      parameterName: '/overtime/MONGO_CONNECTION_STRING',
      stringValue: `mongodb://${mongoUsername}:${mongoPassword}@mongodb.overtime:27017/${mongoDbName}?authSource=admin`,
      tier: ssm.ParameterTier.STANDARD,
      description: 'MongoDB connection string'
    });

    // Set the MongoDB endpoint
    this.mongoEndpoint = `mongodb.overtime:27017`;

    // Output the MongoDB endpoint
    new cdk.CfnOutput(this, 'MongoDBEndpoint', {
      value: this.mongoEndpoint
    });
    
    // Output the EFS File System ID and Access Point ID
    new cdk.CfnOutput(this, 'EfsFileSystemId', {
      value: fileSystem.fileSystemId
    });
    
    new cdk.CfnOutput(this, 'EfsAccessPointId', {
      value: accessPoint.accessPointId
    });
  }
}