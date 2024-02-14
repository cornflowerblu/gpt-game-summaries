import {
  Controller,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { GamesService } from '../games/games.service';
import { AuthGuard } from '../auth/auth.guard';
import { TwilioService } from '../twilio/twilio.service';
import { handleHttpException } from '../utils';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientSession, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Game } from 'src/games/models/games.schema';
import { Throttle } from '@nestjs/throttler';

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly chatsService: ChatsService,
    private readonly gamesService: GamesService,
    @InjectConnection() private connection: Connection,
  ) {}

  @Throttle({ default: { limit: 3, ttl: 1000 } })
  @OnEvent('game.analyze')
  async handleGames({ gameDetail, session, users }) {
    return new Promise((resolve) => {
      this.chatsService.getChatResponse(gameDetail, session, users),
        setTimeout(resolve, 1000);
    });
  }

  @Get('messages')
  async getMessages() {
    const session = await this.connection.startSession();
    session.startTransaction();
    await this.twilioService.sendMessage();
    await session
      .commitTransaction()
      .then(async () => await this.cleanUp(session));
  }

  async cleanUp(session: ClientSession) {
    session.startTransaction();
    try {
      await this.gamesService.findNotSummarized().then((games: Game[]) => {
        games.map((g) => this.gamesService.updateSummarized(g.game.id));
      });
      const dropChats = await this.chatsService.dropChats();
      console.log('cleanup complete');
      const response = {
        status: HttpStatus.OK,
        message: `All games analyzed. Cleanup ${
          dropChats ? 'successful' : 'failed'
        }`,
      };
      console.log(response);
      await session.commitTransaction();
      return response;
    } catch (error) {
      session.abortTransaction();
      // Always drop no matter what because it's easier than de-duping
      await this.chatsService.dropChats();
      console.log(error);
      if (error instanceof HttpException) {
        return handleHttpException(error);
      } else {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Game analysis failed`,
        };
      }
    } finally {
      await session.endSession();
    }
  }
}
