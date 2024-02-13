import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GameDetails, OtePlayer } from './games.interfaces';

export type GameDetailDocument = HydratedDocument<GameDetails>;

@Schema({ collection: 'gameDetails' })
export class GameDetail implements GameDetails {
  @Prop() postgresId: string;
  @Prop() created_at: string;
  @Prop() updated_at: string;
  @Prop() ote_game_id: string;
  @Prop() ote_player_id: string;
  @Prop() ote_team_id: string;
  @Prop() assists_defensive?: number;
  @Prop() assists_turnover_ratio?: number;
  @Prop() assists?: number;
  @Prop() blocks_received?: number;
  @Prop() blocks?: number;
  @Prop() dunks?: number;
  @Prop() efficiency_custom?: number;
  @Prop() efficiency: number;
  @Prop() fast_break_points_made?: number;
  @Prop() field_goals_attempted?: number;
  @Prop() field_goals_effective_percentage?: number;
  @Prop() field_goals_made?: number;
  @Prop() field_goals_percentage?: number;
  @Prop() fouls_coach_disqualifying?: number;
  @Prop() fouls_coach_technical?: number;
  @Prop() fouls_disqualifying?: number;
  @Prop() fouls_drawn?: number;
  @Prop() fouls_offensive?: number;
  @Prop() fouls_personal?: number;
  @Prop() fouls_technical?: number;
  @Prop() fouls_total: number;
  @Prop() fouls_unsportsmanlike?: number;
  @Prop() free_throws_attempted?: number;
  @Prop() free_throws_made: number;
  @Prop() free_throws_percentage?: number;
  @Prop() index_of_success: number;
  @Prop() minutes?: number;
  @Prop() pir: number;
  @Prop() points_fast_break_attempted?: number;
  @Prop() points_fast_break_made?: number;
  @Prop() points_fast_break?: number;
  @Prop() points_from_turnover?: number;
  @Prop() points_in_the_paint_attempted?: number;
  @Prop() points_in_the_paint_made?: number;
  @Prop() points_in_the_paint?: number;
  @Prop() points_second_chance_attempted?: number;
  @Prop() points_second_chance_made?: number;
  @Prop() points_second_chance?: number;
  @Prop() points_three_attempted?: number;
  @Prop() points_three_made?: number;
  @Prop() points_three_percentage?: number;
  @Prop() points_two_attempted?: number;
  @Prop() points_two_made?: number;
  @Prop() points_two_percentage?: number;
  @Prop() points: number;
  @Prop() rebounds_defensive?: number;
  @Prop() rebounds_offensive?: number;
  @Prop() rebounds_total?: number;
  @Prop() second_chance_points_made?: number;
  @Prop() steals?: number;
  @Prop() three_pointers_attempted?: number;
  @Prop() three_pointers_made?: number;
  @Prop() three_pointers_percentage?: number;
  @Prop() true_shooting_attempts: number;
  @Prop() true_shooting_percentage: number;
  @Prop() turnovers_percentage: number;
  @Prop() turnovers?: number;
  @Prop() two_pointers_attempted?: number;
  @Prop() two_pointers_made?: number;
  @Prop() two_pointers_percentage?: number;
  @Prop() double_double: number;
  @Prop() minus?: number;
  @Prop() plus?: number;
  @Prop() plus_minus?: number;
  @Prop() triple_double: number;
  @Prop() active: boolean;
  @Prop() captain: boolean;
  @Prop() did_not_play_reason: string;
  @Prop() is_player: boolean;
  @Prop() is_team_official: boolean;
  @Prop() participated: boolean;
  @Prop() playing_position: string;
  @Prop() pno: string;
  @Prop() shirt_number: string;
  @Prop() starter: boolean;
  @Prop({
    type: Object,
  })
  ote_player: OtePlayer;
}

export const GameDetailSchema = SchemaFactory.createForClass(GameDetail);
