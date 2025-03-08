import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { CryptoService } from '../crypto/crypto.service';
import { HttpException } from '@nestjs/common';
import { handleHttpException } from '../utils';
import mongoose from 'mongoose';

describe('UserService', () => {
  let service: UserService;
  let userModel: any;
  let cryptoService: any;
  let connectionMock: any;
  let sessionMock: any;

  beforeEach(async () => {
    sessionMock = {
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
      findById: jest.fn().mockReturnThis(),
      db: {
        startSession: jest.fn().mockResolvedValue(sessionMock),
      },
    };

    connectionMock = {
      startSession: jest.fn().mockResolvedValue(sessionMock),
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
        { provide: getConnectionToken(), useValue: connectionMock },
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
    const session = sessionMock;
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
      { 
        playerId: 'playerId',
        phoneNumber: 'encryptedPhoneNumber',
        keys: { key: 'key', iv: 'iv' },
        toJSON: () => ({
          playerId: 'playerId',
          phoneNumber: 'encryptedPhoneNumber',
          keys: { key: 'key', iv: 'iv' }
        })
      },
    ]);
    const createUserDto = {
      name: 'Jane Doe',
      phoneNumber: 'decryptedPhoneNumber',
      playerId: 'playerId',
    };
    const session = sessionMock;
    
    const result = await service.create(createUserDto as any, session);
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('status');
    expect(userModel.create).not.toHaveBeenCalled();
  });

  it('should handle errors during user creation', async () => {
    const session = sessionMock;
    const error = new HttpException('Failed to create user', 500);
    userModel.create.mockRejectedValueOnce(error);
    const createUserDto = {
      name: 'Jane Doe',
      phoneNumber: '1234567890',
      playerId: 'playerId',
    };

    const result = await service.create(createUserDto as any, session);
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('status');
    expect(userModel.create).toHaveBeenCalled();
  });

  it('should find all users', async () => {
    userModel.exec.mockResolvedValueOnce([
      {
        toJSON: () => ({
          id: '1',
          name: 'John Doe',
          phoneNumber: 'encryptedPhoneNumber',
          keys: { key: 'key', iv: 'iv' }
        }),
        phoneNumber: 'encryptedPhoneNumber',
        keys: { key: 'key', iv: 'iv' }
      }
    ]);
    const session = sessionMock;
    const result = await service.findAll(session);
    expect(Array.isArray(result)).toBe(true);
    expect(userModel.find).toHaveBeenCalled();
  });
});
