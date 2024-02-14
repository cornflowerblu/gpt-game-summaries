import { HttpStatus, Injectable } from '@nestjs/common';
import { ChatsService } from '../chats/chats.service';
import { GamesService } from '../games/games.service';
import client from 'twilio';
import { ConfigService } from '@nestjs/config';
import { TwilioConfig } from 'src/config/twilio';

@Injectable()
export class TwilioService {
  constructor(
    private readonly chatService: ChatsService,
    private readonly gameService: GamesService,
    private readonly configService: ConfigService<TwilioConfig>,
  ) {}

  async sendMessage(): Promise<any> {
    const nonSummarizedGames =
      (await this.gameService.findNotSummarized()) as any;

    if (nonSummarizedGames.status === 404) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: `No games to summarize`,
      };
    }

    const gameIds = nonSummarizedGames.map((g) => g.game.id);
    console.log(gameIds, 'gameIds');

    function delay(milliseconds) {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    let chats = [];

    while (chats.length < nonSummarizedGames.length) {
      console.log('waiting for chats');
      await delay(5000);
      chats = (await this.chatService.findByGameId(gameIds)).filter(
        (c) => c.users.length > 0,
      );
    }

    await delay(5000);

    chats = (await this.chatService.findByGameId(gameIds)).filter(
      (c) => c.users.length > 0,
    );

    for (const chat of chats) {
      const twilioClient = client(
        this.configService.get('accountSid'),
        this.configService.get('authToken'),
      );
      const phoneNumbers = chat.users.map((u) => u.phoneNumber);
      const msg =
        chat.analysis +
        '\n\n' +
        `https://overtimeelite.com/games/${gameIds}/box_score`;
      for (const phoneNumber of phoneNumbers) {
        await twilioClient.messages.create({
          body: msg,
          messagingServiceSid: 'MGd75168c276fab36f5e04528a6a44b134',
          to: phoneNumber,
        });
        console.log('Sending message to: ' + phoneNumber);
      }
    }
  }
}
