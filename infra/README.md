# Overtime OTE Player Summaries Infrastructure

This directory contains the AWS CDK code for deploying the Overtime OTE Player Summaries service.

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js and npm installed
- AWS CDK installed (`npm install -g aws-cdk`)
- GitHub personal access token stored in AWS Secrets Manager (for CI/CD pipeline)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Build the TypeScript code:
   ```
   npm run build
   ```

3. Bootstrap your AWS environment (if not already done):
   ```
   cdk bootstrap
   ```

4. Store your GitHub personal access token in AWS Secrets Manager:
   ```
   aws secretsmanager create-secret --name github-token --secret-string "your-github-token"
   ```

5. Update the GitHub configuration in `bin/infra.ts`:
   ```typescript
   githubOwner: 'your-github-username', // Replace with your GitHub username
   githubRepo: 'overtime-ote-player-summaries', // Replace with your repository name
   githubBranch: 'main', // Replace with your branch name
   ```

## Deployment

To deploy the infrastructure stack:
```
cdk deploy OvertimeOtePlayerSummariesStack
```

To deploy the CI/CD pipeline stack:
```
cdk deploy OvertimePipelineStack
```

To deploy both stacks:
```
cdk deploy --all
```

To see what changes will be made before deploying:
```
cdk diff
```

## Infrastructure Components

This CDK project creates two stacks:

### OvertimeOtePlayerSummariesStack

- ECR Repository for Docker images
- ECS Fargate Task Definition
- ECS Fargate Service
- Application Load Balancer Target Group
- IAM Roles and Policies
- CloudWatch Log Group

### OvertimePipelineStack

- CodePipeline with Source, Build, and Deploy stages
- CodeBuild project for building Docker images
- GitHub webhook for automatic deployments
- IAM roles and policies for CI/CD services
- S3 bucket for pipeline artifacts

## IAM Roles

The stack creates two IAM roles:

1. **Task Execution Role** (`EcsTaskExecutionRole`):
   - Permissions for ECS to pull container images and publish logs
   - Includes the following managed policies:
     - AmazonECSTaskExecutionRolePolicy
     - AmazonEC2ContainerRegistryPullOnly
     - AmazonEC2ContainerServiceRole
     - CloudWatchAgentServerPolicy
     - AmazonECS_FullAccess

2. **Task Role** (`ecsTaskRole`):
   - Permissions for the container application to access AWS services
   - Includes permissions to read SSM parameters under the `/overtime/` path

## Configuration

The stack is configured to use:
- Port 80 for the container and target group
- 256 CPU units and 512 MB memory for the Fargate task
- Health check path: `/health`
- AWS Region: us-east-1 (default, can be overridden)

## CI/CD Pipeline

The CI/CD pipeline automatically:
1. Detects changes in your GitHub repository
2. Builds a Docker image from your code
3. Pushes the image to ECR
4. Deploys the new image to your ECS service

The pipeline is triggered automatically when you push to the configured branch.