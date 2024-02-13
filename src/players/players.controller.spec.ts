import { Test } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player } from './players.schema';

describe('PlayersController', () => {
  let playersController: PlayersController;
  let playersService: PlayersService;
  let playerModel: Model<Player>;

  const res = {
    message: jest.fn().mockReturnThis(), // Chainable
    status: jest.fn().mockReturnThis(), // Chainable
    json: jest.fn().mockReturnThis(), // Chainable
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        PlayersService,
        { provide: getModelToken(Player.name), useValue: playerModel },
      ],
    }).compile();

    playersService = moduleRef.get<PlayersService>(PlayersService);
    playersController = moduleRef.get<PlayersController>(PlayersController);
  });

  describe('currentPlayers', () => {
    it('should return an array of players', async () => {
      const result = ['test'];
      jest
        .spyOn(playersService, 'mapPlayers')
        .mockImplementation(() => result as any);

      expect(await playersController.currentPlayers()).toBe(result);
    });

    it('should map the players', async () => {
      const result = [
        {
          _id: 'test',
          name: 'test',
          number: 'test',
          team: 'test',
          playerId: 'test',
        },
      ];
      jest
        .spyOn(playersService, 'mapPlayers')
        .mockImplementation(() => result as any);

      await playersController.currentPlayers();

      expect(playersService.mapPlayers).toHaveBeenCalled();
    });
  });

  describe('getPlayers', () => {
    it('should return an array of players from the database', async () => {
      const result = ['test'];
      jest
        .spyOn(playersService, 'getPlayers')
        .mockImplementation(() => result as any);

      expect(await playersController.getPlayers()).toBe(result);
    });

    it('should get the players', async () => {
      const result = ['test'];
      jest
        .spyOn(playersService, 'getPlayers')
        .mockImplementation(() => result as any);

      await playersController.getPlayers();

      expect(playersService.getPlayers).toHaveBeenCalled();
    });
  });

  describe('addNewPlayer', () => {
    it('should add new players', async () => {
      const result = {
        status: 201,
        message: 'test',
      };
      jest
        .spyOn(playersService, 'addNewPlayer')
        .mockImplementation(() => result as any);

      await playersController.addNewPlayer(res as any);

      expect(playersService.addNewPlayer).toHaveBeenCalled();
    });
  });
});
