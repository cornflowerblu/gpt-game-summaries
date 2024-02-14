import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from './twilio.service';
import { GamesService } from '../games/games.service';
import { ChatsService } from '../chats/chats.service';

describe('TwilioService', () => {
  let twilioService: TwilioService;
  let gamesService: GamesService;
  let chatsService: ChatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TwilioService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: GamesService,
          useValue: {
            findNotSummarized: jest.fn(),
            // Add other methods if needed
          },
        },
        {
          provide: ChatsService,
          useValue: {
            findByGameId: jest.fn(),
          },
        },
      ],
    }).compile();

    twilioService = module.get<TwilioService>(TwilioService);
    gamesService = module.get<GamesService>(GamesService);
    chatsService = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(twilioService).toBeDefined();
  });

  it('should send message', async () => {
    const games = [
      {
        game: {
          id: 'game1',
        },
      },
      {
        game: {
          id: 'game2',
        },
      },
    ];
    const chats = [
      {
        users: [
          {
            phoneNumber: '1234567890',
          },
        ],
      },
    ];
    jest
      .spyOn(gamesService, 'findNotSummarized')
      .mockResolvedValue(games as any);
    jest.spyOn(chatsService, 'findByGameId').mockResolvedValue(chats as any);
    const sendSmsSpy = jest
      .spyOn(twilioService, 'sendMessage')
      .mockResolvedValue(chats[0].users[0].phoneNumber);

    await twilioService.sendMessage();

    expect(sendSmsSpy).toHaveBeenCalled();
    expect(twilioService).resolves;
  });
});
