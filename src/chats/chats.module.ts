import { Module, forwardRef } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chats.schema';
import { GamesModule } from 'src/games/games.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { TwilioModule } from 'src/twilio/twilio.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    GamesModule,
    UsersModule,
    forwardRef(() => TwilioModule),
    AuthModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
