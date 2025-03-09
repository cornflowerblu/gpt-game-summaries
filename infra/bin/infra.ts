#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { OvertimeOtePlayerSummariesStack } from '../lib/overtime-ote-player-summaries-stack';
import { MongoDBStack } from '../lib/mongodb-stack';

const app = new cdk.App();

// Deploy MongoDB stack
const mongoDbStack = new MongoDBStack(app, 'OvertimeMongoDBStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
  description: 'MongoDB database for Overtime OTE Player Summaries'
});

// Deploy application stack
const appStack = new OvertimeOtePlayerSummariesStack(app, 'OvertimeOtePlayerSummariesStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
  description: 'Overtime OTE Player Summaries API'
});

// Add dependency to ensure MongoDB is deployed first
appStack.addDependency(mongoDbStack);