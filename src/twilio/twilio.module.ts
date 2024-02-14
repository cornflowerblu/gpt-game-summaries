import { Module, forwardRef } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { AuthModule } from 'src/auth/auth.module';
import { GamesModule } from 'src/games/games.module';
import { ChatsModule } from 'src/chats/chats.module';

@Module({
  imports: [AuthModule, GamesModule, forwardRef(() => ChatsModule)],
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
