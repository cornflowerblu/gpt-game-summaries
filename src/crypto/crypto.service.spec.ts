import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    // Mock environment variables needed for encryption
    process.env.ENCRYPTION_KEY = 'test-encryption-key';
    process.env.SALT = 'test-salt';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.ENCRYPTION_KEY;
    delete process.env.SALT;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt and decrypt a string', async () => {
    const stringToEncrypt = 'stringToEncrypt';
    const encryptedString = await service.encrypt(stringToEncrypt);
    
    // Verify encrypted string has expected properties
    expect(encryptedString).toHaveProperty('content');
    expect(encryptedString).toHaveProperty('key');
    expect(encryptedString).toHaveProperty('iv');
    
    const decryptedString = await service.decrypt({
      text: encryptedString.content,
      key: encryptedString.key,
      iv: encryptedString.iv,
    });
    
    expect(decryptedString).toEqual(stringToEncrypt);
  }, 10000);
});