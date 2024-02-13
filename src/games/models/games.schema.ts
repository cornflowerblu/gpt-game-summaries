import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Games, OteGames } from './games.interfaces';

export type GameDocument = HydratedDocument<Games>;

@Schema({ collection: 'games' })
export class Game {
  @Prop()
  id?: string;

  @Prop({
    default: false,
  })
  processed: boolean;

  @Prop({
    default: false,
  })
  summarized: boolean;

  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  game: OteGames;
}

export const GameSchema = SchemaFactory.createForClass(Game);
