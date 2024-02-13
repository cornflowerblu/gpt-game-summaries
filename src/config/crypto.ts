import invariant from 'tiny-invariant';

export interface CryptoConfig {
  encryptionKey: string;
}

export default () => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  invariant(encryptionKey, 'ENCRYPTION_KEY environment variable is required');

  return {
    encryptionKey,
  };
};
