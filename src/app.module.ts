import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { MongooseModule } from '@nestjs/mongoose';
// import { UsersModule } from './users/users.module';
// import { CryptoModule } from './crypto/crypto.module';
import { ConfigModule } from '@nestjs/config';
// import { GamesModule } from './games/games.module';
// import { AuthModule } from './auth/auth.module';
// import { PlayersModule } from './players/players.module';
// import { ChatsModule } from './chats/chats.module';
// import { TwilioModule } from './twilio/twilio.module';
// import { EventEmitterModule } from '@nestjs/event-emitter';
// import database, { DatabaseConfig } from './config/database';
// import chat from './config/chat';
// import twilio from './config/twilio';
import health from './config/health';
// import crypto from './config/crypto';
// import { HttpModule } from '@nestjs/axios';
// import worker from './config/worker';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [health /*database, chat, twilio, crypto, worker*/],
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService<DatabaseConfig>) => ({
    //     uri: `mongodb+srv://ote:${configService.get(
    //       'password',
    //     )}@ote-game-summary.udgyq8s.mongodb.net/?retryWrites=true&w=majority`,
    //     dbName: `${configService.get('dbName')}`,
    //   }),
    //   inject: [ConfigService],
    // }),
    // EventEmitterModule.forRoot(),
    // UsersModule,
    // GamesModule,
    // AuthModule,
    // CryptoModule,
    // PlayersModule,
    // ChatsModule,
    // TwilioModule,
    // HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
