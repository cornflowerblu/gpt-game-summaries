import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from 'src/users/users.schema';

export interface IChat {
  id?: string;
  users: Partial<User[]>;
  gameId: string;
  analysis: string;
}

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ collection: 'chats' })
export class Chat implements IChat {
  @Prop()
  id?: string;

  @Prop({
    type: Array,
  })
  users: Partial<User[]>;

  @Prop()
  gameId: string;

  @Prop()
  analysis: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
