import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { IsNotEmpty } from 'class-validator';

export interface IPlayers {
  id?: string;
  name: string;
  number: string;
  team: string;
  playerId: string;
}

export type PlayerDocument = HydratedDocument<Player>;

@Schema({ collection: 'players' })
export class Player implements IPlayers {
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
  })
  _id?: ObjectId;

  @Prop()
  @IsNotEmpty()
  name: string;

  @Prop()
  @IsNotEmpty()
  number: string;

  @Prop()
  @IsNotEmpty()
  team: string;

  @Prop()
  @IsNotEmpty()
  playerId: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
