import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { GetUsersDto, User } from './users.schema';
import { CreateUserDto } from './users.schema';
import { AuthGuard } from '../auth/auth.guard';
import { GenericResponse } from 'src/utils';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Partial<User | GenericResponse>> {
    const session = await this.userService.startSession();
    try {
      return await this.userService.create(createUserDto, session);
    } catch (error) {
      throw (
        (new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Could not create user',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        {
          cause: error,
        })
      );
    } finally {
      session.endSession();
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | GenericResponse> {
    const session = await this.userService.startSession();
    return await this.userService.findOne(id, session);
  }

  @Get()
  async findAll(): Promise<GetUsersDto[] | GenericResponse> {
    const session = await this.userService.startSession();
    const users = await this.userService.findAll(session);
    const userProfiles = new GetUsersDto();
    try {
      return users.map((user) => {
        return {
          ...userProfiles,
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          playerId: user.playerId,
        };
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
