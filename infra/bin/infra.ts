#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { OvertimeOtePlayerSummariesStack } from '../lib/overtime-ote-player-summaries-stack';
import { OvertimePipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

// Infrastructure stack
const infraStack = new OvertimeOtePlayerSummariesStack(app, 'OvertimeOtePlayerSummariesStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
});

// Pipeline stack
new OvertimePipelineStack(app, 'OvertimePipelineStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
  ecrRepository: infraStack.ecrRepository,
  ecsCluster: 'overtime-cluster',
  ecsService: 'overtime-ote-player-summaries-80',
  githubOwner: 'your-github-username', // Replace with your GitHub username
  githubRepo: 'overtime-ote-player-summaries', // Replace with your repository name
  githubBranch: 'main', // Replace with your branch name
  githubTokenSecretName: 'github-token', // Name of the secret in AWS Secrets Manager containing your GitHub token
});