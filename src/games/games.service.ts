import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model, Error, ClientSession } from 'mongoose';
import { Game } from './models/games.schema';
import { GameDetail } from './models/gameDetails.schema';
import { InjectModel } from '@nestjs/mongoose';
import { OteGames } from './models/games.interfaces';
import { GenericResponse, handleHttpException } from '../utils';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name) private gamesModel: Model<Game>,
    @InjectModel(GameDetail.name) private gameDetailsModel: Model<GameDetail>,
  ) {}

  async startSession(): Promise<ClientSession> {
    return await this.gamesModel.db.startSession();
  }

  async updateSummarized(
    id: string,
    // session?: ClientSession,
  ): Promise<GenericResponse> {
    // session.startTransaction();
    try {
      await this.gamesModel
        .updateMany(
          {
            'game.id': id,
          },
          {
            summarized: true,
          },
        )
        .exec();
      // session.commitTransaction();
      return {
        status: HttpStatus.OK,
        message: 'Game updated',
      };
    } catch (error) {
      // session.abortTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
    } finally {
      // await session.endSession();
    }
  }

  async fetchRemoteGames(): Promise<Array<Game>> {
    const request = async () =>
      await fetch(
        'https://api.itsovertime.com/api/ote_games/v1/public/completed',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      )
        .then((response) => response.json())
        .catch((error) => {
          console.error(error),
            new HttpException('Failed to sync completed games', 500);
        });

    const completed = await request();
    const completedGames = completed?.ote_games.map((game) => game);
    return completedGames;
  }

  async fetchStoredGames(): Promise<Array<OteGames>> {
    const session = await this.gamesModel.db.startSession();
    session.startTransaction();
    try {
      const gamesResponse = (await this.gamesModel.find().exec()).flat();
      session.commitTransaction();
      const games = gamesResponse.map((game) => game.game);
      return games;
    } catch (error) {
      session.abortTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }

  async addGames(session: ClientSession): Promise<GenericResponse> {
    session.startTransaction();
    try {
      const remoteGamesResponse = await this.fetchRemoteGames();
      const storedGamesResponse = await this.fetchStoredGames();
      const filteredGames = remoteGamesResponse.filter(
        (remoteGame) =>
          !storedGamesResponse.some(
            (storedGame) => storedGame.id === remoteGame.id,
          ),
      );

      if (filteredGames.length === 0) {
        session.abortTransaction();
        console.log('No new games!');
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'No new games!',
        };
      }

      session.commitTransaction();
      try {
        session.startTransaction();
        const newGames = filteredGames.map(async (game) => {
          await this.gamesModel.create({
            processed: false,
            summarized: false,
            game,
          });
        });
        session.commitTransaction();
        console.log(`${newGames.length} new games added`);
        return {
          status: HttpStatus.OK,
          message: `${newGames.length} new games added`,
        };
        // catches errors for getting games
      } catch (error) {
        session.abortTransaction();
        if (error instanceof HttpException) {
          console.error(error);
          return handleHttpException(error);
        }
      }
      // catches errors for writing games
    } catch (error) {
      session.abortTransaction();
      if (error instanceof HttpException) {
        console.error(error);
        throw {
          status: error.getStatus(),
          message: error.getResponse().toString(),
        };
      } else {
        const dbError = error as Error;
        if (dbError.stack.includes('duplicate key error')) {
          throw {
            status: HttpStatus.BAD_REQUEST,
            message: 'Game already exists',
          };
        }
      }
    } finally {
      await session.endSession();
    }
  }

  async findNotSummarized(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _session?: ClientSession,
  ): Promise<Game[] | { status: HttpStatus; message: string }> {
    // session.startTransaction();
    try {
      const games = this.gamesModel
        .find({
          summarized: false,
        })
        .exec();

      if (!games) {
        // session.abortTransaction();
        console.log('No new games!');
        throw new HttpException('No new games!', HttpStatus.NOT_FOUND);
      }

      if ((await games).length === 0) {
        // session.abortTransaction();
        console.log('No new games!');
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'No new games!',
        };
      }

      // session.commitTransaction();
      return games;
    } catch (error) {
      // session.abortTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
    } finally {
      // await session.endSession();
    }
  }

  async findAndQueueChat(session: ClientSession): Promise<any> {
    session.startTransaction();
    const games = await this.gamesModel
      .find({ summarized: false, processed: true })
      .exec();

    const gameIds = games.map((game) => game.game.id);
    const gameDetails = await this.gameDetailsModel.find({
      ote_game_id: { $in: gameIds },
      minutes: { $gt: 0 },
    });
    session.commitTransaction();
    session.endSession();
    return gameDetails;
  }

  async getGameDetails(gameIds: Array<string>): Promise<any> {
    const gameDetailsPromises = gameIds.map(async (gameId) => {
      const response = await fetch(
        `https://api.itsovertime.com/api/ote_games/v1/public/${gameId}/ote_games_ote_players_ote_teams`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        try {
          const data = await response.json();
          const gameDetails =
            data.ote_games_ote_players_ote_teams as Array<GameDetail>;
          return gameDetails;
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          }
        }
      } else {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Failed to prep for analysis',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    });

    try {
      const allGameDetails = await Promise.all(gameDetailsPromises);
      const existingGameDetails = await this.checkUniqueGames(gameIds);

      if (existingGameDetails === false) {
        return {
          status: HttpStatus.OK,
          message: 'Game details already exist',
        };
      }

      const gameDetails = await this.gameDetailsModel.insertMany(
        allGameDetails.flat(),
      );
      const uniqueGameIds = gameDetails
        .map((gameDetail) => gameDetail.ote_game_id)
        .filter(
          (ote_game_id, index, self) => self.indexOf(ote_game_id) === index,
        );

      await this.gamesModel.updateMany(
        { 'game.id': { $in: uniqueGameIds } },
        { processed: true },
      );
      return {
        status: HttpStatus.OK,
        message: `${gameDetails.length} new game details added for ${uniqueGameIds.length} games`,
      };
    } catch (error) {
      // Handle the error here
    }
  }

  async checkUniqueGames(gameIds: Array<string>): Promise<boolean> {
    const session = await this.gamesModel.db.startSession();
    try {
      const games = await this.gamesModel
        .find({
          'game.id': { $in: gameIds },
          processed: false,
        })
        .exec();

      if (games.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }

  async findGameById(id: string): Promise<Game> {
    const session = await this.gamesModel.db.startSession();
    session.startTransaction();
    try {
      const game = await this.gamesModel
        .findOne({
          _id: id,
        })
        .exec();

      if (!game) {
        session.abortTransaction();
        throw new HttpException('Game not found!', HttpStatus.NOT_FOUND);
      }

      session.commitTransaction();
      return game;
    } catch (error) {
      session.abortTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }
}
