import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from './players.schema';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PlayersService {
  constructor(@InjectModel(Player.name) private playerModel: Model<Player>) {}

  async fetchAll(): Promise<any[]> {
    const response = await fetch(
      'https://api.itsovertime.com/api/ote_players/v1/public',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then((res) => res.json());
    const ote_players = response.ote_players;

    return ote_players.filter((player) => player.is_current === true);
  }

  async mapPlayers(): Promise<Player[]> {
    const players = await this.fetchAll();
    const playerIds = (await this.playerModel.find().exec()).map((p) => {
      return {
        _id: p._id,
        playerId: p.playerId,
      };
    });
    return players.map((player) => {
      return {
        _id: playerIds.find((p) => p.playerId === player.id)?._id,
        name: player.full_name,
        number: player.jersey_number,
        team: player.ote_team.name,
        playerId: player.id,
      };
    });
  }

  async addNewPlayer(): Promise<any> {
    const newPlayer = (await this.mapPlayers()).filter((p) => !p._id);
    if (newPlayer.length > 0) {
      const players = await this.playerModel.insertMany(newPlayer);
      return players;
    }
    return {
      status: HttpStatus.NOT_FOUND,
      message: 'No new players to add.',
    };
  }

  async updatePlayer(): Promise<any> {
    const emitter = new EventEmitter2();

    emitter.on(
      'player.update',
      async (player: Player) => {
        return new Promise(async (resolve) => {
          await this.playerModel
            .findByIdAndUpdate(player._id, {
              name: player.name,
              number: player.number,
              team: player.team,
            })
            .exec();
          setTimeout(resolve, 1000);
        }).then(() => console.log(`${player.name} updated.`));
      },
      {
        promisify: true,
      },
    );

    const players = (await this.mapPlayers()).map((player) => player);

    const updatePlayers = async () => {
      let updates = 0;
      for (const player of players) {
        if (!player._id) {
          continue;
        }
        await Promise.resolve(emitter.emit('player.update', player)).then(
          () => updates++,
        );
      }
      return updates;
    };

    const updatedPlayers = await updatePlayers();

    return {
      status: HttpStatus.OK,
      message: `${updatedPlayers} players updated.`,
    };
  }

  async getPlayers(): Promise<Player[]> {
    return this.playerModel.find().exec();
  }
}
