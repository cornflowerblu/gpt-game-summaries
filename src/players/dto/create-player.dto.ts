import { IPlayers } from '../players.schema';

export class CreatePlayerDto implements IPlayers {
  id?: string;
  name: string;
  number: string;
  team: string;
  playerId: string;
}
