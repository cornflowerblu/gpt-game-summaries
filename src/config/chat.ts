import invariant from 'tiny-invariant';

export interface ChatConfig {
  openaiApiKey: string;
}

export default () => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  invariant(openaiApiKey, 'OPENAI_API_KEY environment variable is required');

  return {
    openaiApiKey,
  };
};
