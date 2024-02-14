import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { IsPhoneNumber, IsNotEmpty, IsUUID } from 'class-validator';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User {
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
  })
  id: ObjectId;

  @Prop()
  name: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  playerId: string;

  @Prop({
    required: false,
    type: Object,
  })
  keys: {
    iv: string;
    key: string;
  };
}

export class CreateUserDto extends User {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber('US')
  phoneNumber: string;

  @IsNotEmpty()
  @IsUUID()
  playerId: string;
}

export class GetUsersDto extends User {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber('US')
  phoneNumber: string;

  @IsNotEmpty()
  playerId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
