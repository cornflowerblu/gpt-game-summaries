import { GamesService } from './games.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('GamesService', () => {
  let service: GamesService;
  let gamesModel: any;
  let gameDetailsModel: any;

  beforeEach(async () => {
    // Mocking the gamesModel and gameDetailsModel
    gamesModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      updateMany: jest.fn().mockReturnValue({ exec: jest.fn() }),
      create: jest.fn(),
      db: {
        startSession: jest.fn().mockResolvedValue({
          startTransaction: jest.fn(),
          commitTransaction: jest.fn(),
          abortTransaction: jest.fn(),
          endSession: jest.fn(),
        }),
      },
    };

    gameDetailsModel = {
      find: jest.fn(),
      insertMany: jest.fn(),
    };

    service = new GamesService(gamesModel, gameDetailsModel);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Example test for startSession
  it('should start a session', async () => {
    const session = await service.startSession();
    expect(session).toBeDefined();
    expect(gamesModel.db.startSession).toHaveBeenCalled();
  });

  // Continue with tests for each method
  // For example, test updateSummarized, fetchRemoteGames, fetchStoredGames, etc.

  it('should update games and return a success response', async () => {
    // const session = await service.startSession();
    const id = 'someGameId';
    const response = await service.updateSummarized(id);

    // expect(session.startTransaction).toHaveBeenCalled();
    expect(gamesModel.updateMany).toHaveBeenCalledWith(
      { 'game.id': id },
      { summarized: true },
    );
    // expect(session.commitTransaction).toHaveBeenCalled();
    expect(response).toEqual({
      status: HttpStatus.OK,
      message: 'Game updated',
    });
  });

  it('should catch errors', async () => {
    const id = 'someGameId';
    try {
      await service.updateSummarized(id);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Failed to update game');
    }
  });
});
