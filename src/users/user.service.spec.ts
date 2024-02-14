import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { CryptoService } from '../crypto/crypto.service';
import { HttpException } from '@nestjs/common';
import { handleHttpException } from '../utils';

describe('UserService', () => {
  let service: UserService;
  let userModel: any;
  let cryptoService: any;

  beforeEach(async () => {
    const sessionMock = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    userModel = {
      create: jest
        .fn()
        .mockImplementation((userData) => Promise.resolve(userData)),
      find: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
      db: {
        startSession: jest.fn().mockResolvedValue(sessionMock),
      },
    };

    cryptoService = {
      encrypt: jest.fn().mockResolvedValue({
        content: 'encryptedPhoneNumber',
        iv: 'iv',
        key: 'key',
      }),
      decrypt: jest.fn().mockResolvedValue('decryptedPhoneNumber'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken('User'), useValue: userModel },
        { provide: CryptoService, useValue: cryptoService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should successfully create a new user', async () => {
    const createUserDto = {
      name: 'John Doe',
      phoneNumber: '1234567890',
      playerId: 'playerId',
    };
    const session = await service.startSession();
    const result = await service.create(createUserDto as any, session);
    expect(result).toEqual(
      expect.objectContaining({
        id: undefined,
        name: createUserDto.name,
        phoneNumber: 'encryptedPhoneNumber',
        playerId: createUserDto.playerId,
      }),
    );
    expect(cryptoService.encrypt).toHaveBeenCalledWith(
      createUserDto.phoneNumber,
    );
    expect(userModel.create).toHaveBeenCalled();
  });

  it('should not create a user if the phone number already exists', async () => {
    userModel.exec.mockResolvedValueOnce([
      { phoneNumber: 'encryptedPhoneNumber' },
    ]);
    const createUserDto = {
      name: 'Jane Doe',
      phoneNumber: 'decryptedPhoneNumber',
      playerId: 'anotherPlayerId',
    };
    const session = await service.startSession();
    await expect(
      service.create(createUserDto as any, session),
    ).rejects.toThrow();
    expect(userModel.create).not.toHaveBeenCalled();
  });

  it('should handle errors during user creation', async () => {
    const session = await service.startSession();
    const error = new HttpException('Failed to create user', 500);
    const customError = handleHttpException(error);
    userModel.create.mockRejectedValueOnce(customError);
    const createUserDto = {
      name: 'Jane Doe',
      phoneNumber: '1234567890',
      playerId: 'playerId',
    };

    await expect(
      service.create(createUserDto as any, session),
    ).rejects.toThrow();
    expect(userModel.create).toHaveBeenCalled();
  });

  it('should find all users', async () => {
    userModel.find.exec = jest.fn().mockResolvedValue([]);
    const session = await service.startSession();
    const result = await service.findAll(session);
    expect(result).toEqual([]);
    expect(userModel.find).toHaveBeenCalled();
  });
});
