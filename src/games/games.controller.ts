import {
  Controller,
  HttpStatus,
  Get,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { AuthGuard } from '../auth/auth.guard';
import { Game } from './models/games.schema';
import { GameDetail } from './models/gameDetails.schema';
import { GenericResponse, handleHttpException } from '../utils';

@Controller('games')
@UseGuards(AuthGuard)
export class GamesController {
  userModel: any;
  gameDetailsModel: any;
  constructor(private readonly gamesService: GamesService) {}

  @Get('current')
  async getCurrentGame(): Promise<GenericResponse> {
    const session = await this.gamesService.startSession();
    await this.gamesService.addGames(session);

    // if (games.status == HttpStatus.NOT_FOUND) {
    //   return games;
    // }

    try {
      const notSummarized = (await this.gamesService.findNotSummarized(
        session,
      )) as Array<Game> | any;

      if (notSummarized.length === 0) {
        return { status: HttpStatus.OK, message: 'All games summarized' };
      }

      if (notSummarized.status == HttpStatus.NOT_FOUND) {
        return notSummarized;
      }

      const gameIds = notSummarized.flatMap((game) => game.game.id);

      if (gameIds.length === 0 || gameIds === undefined) {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Could not find gameIds',
        };
      }

      return await this.gamesService.getGameDetails(gameIds);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return handleHttpException(error);
      } else {
        throw error;
      }
    }
  }

  @Get()
  async getCurrentGames(): Promise<GenericResponse> {
    const session = await this.gamesService.startSession();
    return await this.gamesService.addGames(session);
  }

  @Get('details')
  async createGameDetails(): Promise<GameDetail[] | GenericResponse> {
    const session = await this.gamesService.startSession();
    const notSummarized = (await this.gamesService.findNotSummarized(
      session,
    )) as Array<Game>;

    if (notSummarized.length === 0) {
      return { status: HttpStatus.OK, message: 'All games summarized' };
    }

    const gameIds = notSummarized.flatMap((game) => game.game.id);

    if (gameIds.length === 0 || gameIds === undefined) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Could not find gameIds',
      };
    }

    return await this.gamesService.getGameDetails(gameIds);
  }
}
