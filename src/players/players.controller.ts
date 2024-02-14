import { Controller, UseGuards, Get, Post, Res } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PlayersService } from './players.service';
import { Response } from 'express';

@Controller('players')
@UseGuards(AuthGuard)
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('current')
  async currentPlayers() {
    return this.playersService.mapPlayers();
  }

  @Get()
  async getPlayers() {
    return this.playersService.getPlayers();
  }

  @Post('create')
  async addNewPlayer(@Res() res: Response) {
    const response = await this.playersService.addNewPlayer();

    if (response.status === 404) {
      return res.status(400).json(response);
    }

    return res.status(201).json(response);
  }

  @Post('update')
  async updatePlayer(@Res() res: Response) {
    const response = await this.playersService.updatePlayer();

    if (response.status > 299) {
      return res.status(400).json(response);
    }

    return res.status(200).json(response);
  }
}
