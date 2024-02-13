import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const userServiceMock = {
      create: jest.fn().mockResolvedValue({}),
      findAll: jest.fn().mockResolvedValue([]),
      startSession: jest.fn().mockResolvedValue({}),
      // Add other methods as needed
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should create a user', async () => {
    const createUserDto = {
      name: 'Test User',
      phoneNumber: '1234567890',
      playerId: 'player1',
    };

    const result = await controller.create(createUserDto as any);

    expect(result).toEqual({});
    expect(userService.create).toHaveBeenCalledWith(createUserDto, {});
  });

  it('should find all users', async () => {
    const result = await controller.findAll();

    expect(result).toEqual([]);
    expect(userService.findAll).toHaveBeenCalled();
  });

  // Add other tests as needed
});
