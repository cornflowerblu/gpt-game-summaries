import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChatsService } from './chats.service';
import { Chat } from './chats.schema';
import { ClientSession } from 'mongoose';

describe('ChatsService', () => {
  let service: ChatsService;
  let chatModel: any;

  beforeEach(async () => {
    chatModel = {
      create: jest.fn(),
      db: {
        startSession: jest.fn(),
      },
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        {
          provide: getModelToken(Chat.name),
          useValue: chatModel,
        },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a chat', async () => {
    const chat = new Chat();
    chatModel.create.mockResolvedValue(chat);
    expect(await service.create(chat)).toBe(chat);
    expect(chatModel.create).toHaveBeenCalledWith(chat);
  });

  it('should start a session', async () => {
    const session = {} as ClientSession;
    chatModel.db.startSession.mockResolvedValue(session);
    expect(await service.startSession()).toBe(session);
    expect(chatModel.db.startSession).toHaveBeenCalled();
  });

  it('should find chats by game id', async () => {
    const chats = [new Chat(), new Chat()];
    const gameIds = ['game1', 'game2'];
    chatModel.find.mockResolvedValue(chats);
    expect(await service.findByGameId(gameIds)).toBe(chats);
    expect(chatModel.find).toHaveBeenCalledWith({ gameId: gameIds });
  });

  // Add more tests for getChatResponse method
});
