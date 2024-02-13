import invariant from 'tiny-invariant';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
}

export default () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  invariant(accountSid, 'TWILIO_ACCOUNT_SID environment variable is required');

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  invariant(authToken, 'TWILIO_AUTH_TOKEN environment variable is required');

  return {
    accountSid,
    authToken,
  };
};
