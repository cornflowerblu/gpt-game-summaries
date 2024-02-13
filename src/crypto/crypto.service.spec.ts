import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt and decrypt a string', async () => {
    const stringToEncrypt = 'stringToEncrypt';
    const encryptedString = await service.encrypt(stringToEncrypt);
    const decryptedString = await service.decrypt({
      text: encryptedString.content,
      key: encryptedString.key,
      iv: encryptedString.iv,
    });
    expect(decryptedString).toEqual(stringToEncrypt);
  }, 10000);
});
