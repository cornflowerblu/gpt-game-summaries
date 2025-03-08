# Deploying to Amazon ECS

This guide outlines the steps to deploy the overtime-ote-player-summaries application to Amazon ECS.

## Prerequisites

1. AWS CLI installed and configured with appropriate permissions
2. Docker installed locally
3. An AWS account with access to ECR, ECS, and related services

## Step 1: Create an ECR Repository

```bash
aws ecr create-repository --repository-name overtime-ote-player-summaries --region us-east-1
```

Note: Replace `us-east-1` with your preferred AWS region.

## Step 2: Authenticate Docker to ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your-aws-account-id>.dkr.ecr.us-east-1.amazonaws.com
```

## Step 3: Build and Tag the Docker Image

```bash
docker build -t overtime-ote-player-summaries .
docker tag overtime-ote-player-summaries:latest <your-aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/overtime-ote-player-summaries:latest
```

## Step 4: Push the Image to ECR

```bash
docker push <your-aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/overtime-ote-player-summaries:latest
```

## Step 5: Create ECS Resources

### Create a Task Definition

Create a file named `task-definition.json`:

```json
{
  "family": "overtime-ote-player-summaries",
  "networkMode": "awsvpc",
  "executionRoleArn": "arn:aws:iam::<your-aws-account-id>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<your-aws-account-id>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "overtime-ote-player-summaries",
      "image": "<your-aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/overtime-ote-player-summaries:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "ENCRYPTION_KEY",
          "valueFrom": "arn:aws:ssm:us-east-1:<your-aws-account-id>:parameter/overtime/ENCRYPTION_KEY"
        },
        {
          "name": "SALT",
          "valueFrom": "arn:aws:ssm:us-east-1:<your-aws-account-id>:parameter/overtime/SALT"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/overtime-ote-player-summaries",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "cpu": 256,
      "memory": 512
    }
  ],
  "requiresCompatibilities": [
    "FARGATE"
  ],
  "cpu": "256",
  "memory": "512"
}
```

Register the task definition:

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### Create a Cluster (if you don't have one already)

```bash
aws ecs create-cluster --cluster-name overtime-cluster
```

### Create a Service

```bash
aws ecs create-service \
  --cluster overtime-cluster \
  --service-name overtime-ote-player-summaries \
  --task-definition overtime-ote-player-summaries \
  --desired-count 1 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxx,subnet-yyyyyyyy],securityGroups=[sg-zzzzzzzz],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<your-aws-account-id>:targetgroup/overtime-tg/xxxxxxxx,containerName=overtime-ote-player-summaries,containerPort=3000"
```

Note: Replace the subnet IDs, security group ID, and target group ARN with your own values.

## Step 6: Store Secrets in AWS Systems Manager Parameter Store

```bash
aws ssm put-parameter --name "/overtime/ENCRYPTION_KEY" --value "your-encryption-key" --type SecureString
aws ssm put-parameter --name "/overtime/SALT" --value "your-salt" --type SecureString
```

## Step 7: Set Up IAM Roles

Ensure you have the following IAM roles:

1. **ecsTaskExecutionRole**: Allows ECS to pull images from ECR and write logs to CloudWatch
2. **ecsTaskRole**: Allows your application to access AWS services like SSM Parameter Store

## Step 8: Set Up a Load Balancer (Optional but Recommended)

1. Create an Application Load Balancer
2. Create a target group pointing to your ECS service
3. Configure listeners and routing rules

## Step 9: Set Up CI/CD (Optional)

Consider setting up a CI/CD pipeline using AWS CodePipeline, GitHub Actions, or another CI/CD service to automate deployments.

## Monitoring and Logging

- Monitor your application using CloudWatch metrics
- View logs in CloudWatch Logs
- Set up alarms for important metrics

## Scaling

To scale your application:

```bash
aws ecs update-service --cluster overtime-cluster --service overtime-ote-player-summaries --desired-count 2
```

Or set up auto-scaling:

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/overtime-cluster/overtime-ote-player-summaries \
  --min-capacity 1 \
  --max-capacity 10
```