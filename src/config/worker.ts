import invariant from 'tiny-invariant';

export interface WorkerConfig {
  apiKey: string;
  smsUrl: string;
  analysisUrl: string;
}

export default () => {
  const apiKey = process.env.API_KEY;
  invariant(apiKey, 'API_KEY environment variable is required');

  const smsUrl = process.env.SMS_URL;
  invariant(smsUrl, 'SMS_URL environment variable is required');

  const analysisUrl = process.env.ANALYSIS_URL;
  invariant(analysisUrl, 'ANALYSIS_URL environment variable is required');

  return {
    apiKey,
    smsUrl,
    analysisUrl,
  };
};
