#!/bin/bash

# Exit on error
set -e

# Configuration
AWS_REGION="us-east-1"  # Change to your preferred region
ECR_REPOSITORY_NAME="overtime-ote-player-summaries"
ECS_CLUSTER_NAME="overtime-cluster"
ECS_SERVICE_NAME="overtime-ote-player-summaries-80"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

# ECR repository URL
ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}"

echo "=== Building and deploying ${ECR_REPOSITORY_NAME} ==="
echo "AWS Region: ${AWS_REGION}"
echo "ECR Repository: ${ECR_REPOSITORY_URI}"
echo "ECS Cluster: ${ECS_CLUSTER_NAME}"
echo "ECS Service: ${ECS_SERVICE_NAME}"

# Create ECR repository if it doesn't exist
echo "=== Creating ECR repository if it doesn't exist ==="
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY_NAME} --region ${AWS_REGION} || \
  aws ecr create-repository --repository-name ${ECR_REPOSITORY_NAME} --region ${AWS_REGION}

# Authenticate Docker to ECR
echo "=== Authenticating Docker with ECR ==="
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY_URI}

# Build Docker image
echo "=== Building Docker image ==="
docker build -t ${ECR_REPOSITORY_NAME}:latest .

# Tag Docker image
echo "=== Tagging Docker image ==="
docker tag ${ECR_REPOSITORY_NAME}:latest ${ECR_REPOSITORY_URI}:latest

# Push Docker image to ECR
echo "=== Pushing Docker image to ECR ==="
docker push ${ECR_REPOSITORY_URI}:latest

# Update task definition with the new image
echo "=== Updating task definition ==="
# Use the updated task definition file that already has the account ID
cp updated-task-definition.json task-definition.json

# Register the new task definition
TASK_DEFINITION=$(aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ${AWS_REGION} \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "New task definition: ${TASK_DEFINITION}"

# Create or update the service
echo "=== Creating or updating ECS service ==="
if aws ecs describe-services --cluster ${ECS_CLUSTER_NAME} --services ${ECS_SERVICE_NAME} --region ${AWS_REGION} | grep -q "MISSING"; then
  echo "Creating new ECS service..."
  aws ecs create-service \
    --cluster ${ECS_CLUSTER_NAME} \
    --service-name ${ECS_SERVICE_NAME} \
    --task-definition ${TASK_DEFINITION} \
    --desired-count 1 \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-0d4eb4c019ed1991d,subnet-08f3f862d2ed8c20c],securityGroups=[sg-0ca5d85cbc46902fa],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:443370689229:targetgroup/overtime-tg-80/ab45188da6d97ae2,containerName=overtime-ote-player-summaries,containerPort=80" \
    --region ${AWS_REGION}
else
  echo "Updating existing ECS service..."
  aws ecs update-service \
    --cluster ${ECS_CLUSTER_NAME} \
    --service ${ECS_SERVICE_NAME} \
    --task-definition ${TASK_DEFINITION} \
    --region ${AWS_REGION}
fi

echo "=== Deployment completed successfully ==="
echo "The new version of the application is being deployed to ECS."
echo "You can monitor the deployment status in the AWS Management Console."