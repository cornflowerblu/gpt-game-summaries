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
  ecrRepository: infraStack.ecrRepository, // Fix reference to use infraStack
  ecsCluster: 'overtime-cluster',
  ecsService: 'overtime-ote-player-summaries-80', 
  githubOwner: 'cornflowerblu',
  githubRepo: 'gpt-game-summaries',
  githubBranch: 'amazon-q-developer',
  codestarConnectionArn: 'arn:aws:codeconnections:us-east-1:443370689229:connection/91220065-4063-449c-a1e1-682054889c6e',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
