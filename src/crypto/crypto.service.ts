import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import invariant from 'tiny-invariant';
import { promisify } from 'util';

export class CryptoService {
  async encrypt(text: string): Promise<{
    iv: string;
    key: string;
    content: string;
  }> {
    const iv = randomBytes(16);
    const password = process.env.ENCRYPTION_KEY;
    invariant(password, 'Encryption key is not defined');

    const salt = process.env.SALT;
    invariant(salt, 'Salt is not defined');

    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const key = (await promisify(scrypt)(password, salt, 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);

    const textToEncrypt = text;
    const encryptedText = Buffer.concat([
      cipher.update(textToEncrypt),
      cipher.final(),
    ]);
    return {
      iv: iv.toString('hex'),
      key: key.toString('hex'),
      content: encryptedText.toString('hex'),
    };
  }

  async decrypt({
    text,
    key,
    iv,
  }: {
    text: string;
    key: string;
    iv: string;
  }): Promise<string> {
    const textBuffer = Buffer.from(text, 'hex');
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const decipher = createDecipheriv('aes-256-ctr', keyBuffer, ivBuffer);
    const decryptedText = Buffer.concat([
      decipher.update(textBuffer),
      decipher.final(),
    ]);
    return decryptedText.toString();
  }
}
