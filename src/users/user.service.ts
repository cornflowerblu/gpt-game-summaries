import mongoose, { ClientSession, Model } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User, CreateUserDto } from './users.schema';
import { CryptoService } from '../crypto/crypto.service';
import { GenericResponse, handleHttpException } from '../utils';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectConnection() private connection: mongoose.Connection,
    private cryptoService: CryptoService,
  ) {}

  async startSession(): Promise<ClientSession> {
    return await this.connection.startSession();
  }

  async create(
    createUserDto: CreateUserDto,
    session: ClientSession,
  ): Promise<Partial<User | GenericResponse>> {
    session.startTransaction();
    try {
      const users = await this.userModel.find().exec();

      const userPromise = users.map(async (user) => {
        const playerId = user.playerId;
        const phoneNumber = await this.cryptoService.decrypt({
          text: user.phoneNumber,
          key: user.keys.key,
          iv: user.keys.iv,
        });
        return { playerId, phoneNumber };
      });

      const userArray = await Promise.all(userPromise);
      // console.log(userArray);

      const filteredUsers = userArray.filter(
        (user) => user.phoneNumber === createUserDto.phoneNumber,
      );

      if (
        filteredUsers.find((user) => user.playerId === createUserDto.playerId)
      ) {
        console.log('User has already chosen this player.');
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            error: 'User has already chosen this player.',
          },
          HttpStatus.CONFLICT,
        );
      }
      const phoneNumber = await this.cryptoService.encrypt(
        createUserDto.phoneNumber,
      );
      const user = await this.userModel.create({
        ...createUserDto,
        phoneNumber: phoneNumber.content.trim(),
        keys: {
          iv: phoneNumber.iv,
          key: phoneNumber.key,
        },
      });
      await session.commitTransaction();
      return {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        playerId: user.playerId,
      };
    } catch (error) {
      session.abortTransaction();
      return handleHttpException(error);
    } finally {
      await session.endSession();
    }
  }

  async findOne(id: string, session: ClientSession): Promise<User> {
    session.startTransaction();
    try {
      const user = await this.userModel.findById(id).exec();
      const phoneNumber = await this.cryptoService.decrypt({
        text: user.phoneNumber,
        key: user.keys.key,
        iv: user.keys.iv,
      });
      const userWithPhoneNumber = {
        ...user.toJSON(),
        phoneNumber: phoneNumber,
      };
      if (!userWithPhoneNumber) {
        await session.abortTransaction();
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      await session.commitTransaction();
      return userWithPhoneNumber;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async findAll(session: ClientSession): Promise<User[]> {
    session.startTransaction();
    try {
      const users = await this.userModel.find().exec();
      const userPhonePromise = users.map(async (user) => {
        const phoneNumber = await this.cryptoService.decrypt({
          text: user.phoneNumber,
          key: user.keys.key,
          iv: user.keys.iv,
        });
        return phoneNumber;
      });
      const usersWithPhoneNumber = await Promise.all(userPhonePromise).then(
        (values) => {
          return users.map((user, index) => {
            return {
              ...user.toJSON(),
              phoneNumber: values[index],
            };
          });
        },
      );
      await session.commitTransaction();
      return usersWithPhoneNumber;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
