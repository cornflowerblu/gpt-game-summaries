export interface Games {
  _id: string;
  summarized: boolean;
  game: Games;
}

export interface OteGames {
  id: string;
  created_at: string;
  updated_at: string;
  latitude: string;
  longitude: string;
  address: string;
  street: any;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_hidden: boolean;
  is_stats_hidden: boolean;
  competition_name: string;
  purpose: any;
  match_id: MatchId;
  synergy_id: string;
  game_category: string;
  match_time: any;
  match_time_zone: any;
  starts_at: string;
  starts_at_utc_offset: StartsAtUtcOffset;
  starts_at_timezone: string;
  ote_season_id: string;
  ote_event_id: string;
  ote_game_profile_id: string;
  youtube_id: string;
  prime_video_id: any;
  synergy_synced_at: string;
  expected_broadcast: string;
  location_name: any;
  game_clock: any;
  shot_clock: any;
  game_clock_is_running: boolean;
  period: any;
  period_status: string;
  period_type: any;
  status: string;
  google_calendar_id: string;
  google_calendar_synced_at: string;
  ote_season: OteSeason;
  ote_event: OteEvent;
  ote_games_ote_teams: OteGamesOteTeam[];
}

export interface MatchId {
  $numberInt: string;
}

export interface StartsAtUtcOffset {
  $numberInt: string;
}

export interface OteSeason {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  synergy_id: string;
  starts_at: string;
  is_current: boolean;
  is_per_40: boolean;
  should_show_for_players: boolean;
  should_show_for_teams: boolean;
  should_show_for_schedule: boolean;
  should_show_for_leaders: boolean;
  should_show_for_standings: boolean;
}

export interface OteEvent {
  id: string;
  created_at: string;
  updated_at: string;
  starts_at: string;
  title: string;
  description: any;
  image_path: string;
  vivenu_id: string;
  cta_url: any;
  cta_text: any;
  is_sold_out: boolean;
}

export interface OteGamesOteTeam {
  id: string;
  created_at: string;
  updated_at: string;
  is_home_team: boolean;
  ote_team_id: string;
  ote_game_id: string;
  timeouts_remaining: any;
  status: string;
  result: string;
  assists_defensive: AssistsDefensive;
  assists_turnover_ratio: AssistsTurnoverRatio;
  assists: Assists;
  blocks_received: BlocksReceived;
  blocks: Blocks;
  dunks: Dunks;
  efficiency_custom: EfficiencyCustom;
  efficiency: Efficiency;
  fast_break_points_made: FastBreakPointsMade;
  field_goals_attempted: FieldGoalsAttempted;
  field_goals_effective_percentage: FieldGoalsEffectivePercentage;
  field_goals_made: FieldGoalsMade;
  field_goals_percentage: FieldGoalsPercentage;
  fouls_coach_disqualifying: FoulsCoachDisqualifying;
  fouls_coach_technical: FoulsCoachTechnical;
  fouls_disqualifying: FoulsDisqualifying;
  fouls_drawn: FoulsDrawn;
  fouls_offensive: FoulsOffensive;
  fouls_personal: FoulsPersonal;
  fouls_technical: FoulsTechnical;
  fouls_total: FoulsTotal;
  fouls_unsportsmanlike: FoulsUnsportsmanlike;
  free_throws_attempted: FreeThrowsAttempted;
  free_throws_made: FreeThrowsMade;
  free_throws_percentage: FreeThrowsPercentage;
  index_of_success: IndexOfSuccess;
  minutes: Minutes;
  pir: Pir;
  points_fast_break_attempted: PointsFastBreakAttempted;
  points_fast_break_made: PointsFastBreakMade;
  points_fast_break: PointsFastBreak;
  points_from_turnover: PointsFromTurnover;
  points_in_the_paint_attempted: PointsInThePaintAttempted;
  points_in_the_paint_made: PointsInThePaintMade;
  points_in_the_paint: PointsInThePaint;
  points_second_chance_attempted: PointsSecondChanceAttempted;
  points_second_chance_made: PointsSecondChanceMade;
  points_second_chance: PointsSecondChance;
  points_three_attempted: PointsThreeAttempted;
  points_three_made: PointsThreeMade;
  points_three_percentage: PointsThreePercentage;
  points_two_attempted: PointsTwoAttempted;
  points_two_made: PointsTwoMade;
  points_two_percentage: PointsTwoPercentage;
  points: Points;
  rebounds_defensive: ReboundsDefensive;
  rebounds_offensive: ReboundsOffensive;
  rebounds_total: ReboundsTotal;
  second_chance_points_made: SecondChancePointsMade;
  steals: Steals;
  three_pointers_attempted: ThreePointersAttempted;
  three_pointers_made: ThreePointersMade;
  three_pointers_percentage: ThreePointersPercentage;
  true_shooting_attempts: any;
  true_shooting_percentage: any;
  turnovers_percentage: any;
  turnovers: Turnovers;
  two_pointers_attempted: TwoPointersAttempted;
  two_pointers_made: TwoPointersMade;
  two_pointers_percentage: TwoPointersPercentage;
  biggest_lead: BiggestLead;
  biggest_scoring_run: BiggestScoringRun;
  fouls_bench_technical: FoulsBenchTechnical;
  points_against: PointsAgainst;
  points_from_bench: PointsFromBench;
  rebounds_team_defensive: ReboundsTeamDefensive;
  rebounds_team_offensive: ReboundsTeamOffensive;
  rebounds_team_total: ReboundsTeamTotal;
  turnovers_team: TurnoversTeam;
  lead_changes: LeadChanges;
  time_in_lead: TimeInLead;
  times_score_level: TimesScoreLevel;
  score: Score;
  ote_team: OteTeam;
}

export interface AssistsDefensive {
  $numberInt: string;
}

export interface AssistsTurnoverRatio {
  $numberDouble: string;
}

export interface Assists {
  $numberInt: string;
}

export interface BlocksReceived {
  $numberInt: string;
}

export interface Blocks {
  $numberInt: string;
}

export interface Dunks {
  $numberInt: string;
}

export interface EfficiencyCustom {
  $numberInt: string;
}

export interface Efficiency {
  $numberInt: string;
}

export interface FastBreakPointsMade {
  $numberInt: string;
}

export interface FieldGoalsAttempted {
  $numberInt: string;
}

export interface FieldGoalsEffectivePercentage {
  $numberDouble: string;
}

export interface FieldGoalsMade {
  $numberInt: string;
}

export interface FieldGoalsPercentage {
  $numberDouble: string;
}

export interface FoulsCoachDisqualifying {
  $numberInt: string;
}

export interface FoulsCoachTechnical {
  $numberInt: string;
}

export interface FoulsDisqualifying {
  $numberInt: string;
}

export interface FoulsDrawn {
  $numberInt: string;
}

export interface FoulsOffensive {
  $numberInt: string;
}

export interface FoulsPersonal {
  $numberInt: string;
}

export interface FoulsTechnical {
  $numberInt: string;
}

export interface FoulsTotal {
  $numberInt: string;
}

export interface FoulsUnsportsmanlike {
  $numberInt: string;
}

export interface FreeThrowsAttempted {
  $numberInt: string;
}

export interface FreeThrowsMade {
  $numberInt: string;
}

export interface FreeThrowsPercentage {
  $numberDouble: string;
}

export interface IndexOfSuccess {
  $numberInt: string;
}

export interface Minutes {
  $numberInt: string;
}

export interface Pir {
  $numberInt: string;
}

export interface PointsFastBreakAttempted {
  $numberInt: string;
}

export interface PointsFastBreakMade {
  $numberInt: string;
}

export interface PointsFastBreak {
  $numberInt: string;
}

export interface PointsFromTurnover {
  $numberInt: string;
}

export interface PointsInThePaintAttempted {
  $numberInt: string;
}

export interface PointsInThePaintMade {
  $numberInt: string;
}

export interface PointsInThePaint {
  $numberInt: string;
}

export interface PointsSecondChanceAttempted {
  $numberInt: string;
}

export interface PointsSecondChanceMade {
  $numberInt: string;
}

export interface PointsSecondChance {
  $numberInt: string;
}

export interface PointsThreeAttempted {
  $numberInt: string;
}

export interface PointsThreeMade {
  $numberInt: string;
}

export interface PointsThreePercentage {
  $numberDouble: string;
}

export interface PointsTwoAttempted {
  $numberInt: string;
}

export interface PointsTwoMade {
  $numberInt: string;
}

export interface PointsTwoPercentage {
  $numberDouble: string;
}

export interface Points {
  $numberInt: string;
}

export interface ReboundsDefensive {
  $numberInt: string;
}

export interface ReboundsOffensive {
  $numberInt: string;
}

export interface ReboundsTotal {
  $numberInt: string;
}

export interface SecondChancePointsMade {
  $numberInt: string;
}

export interface Steals {
  $numberInt: string;
}

export interface ThreePointersAttempted {
  $numberInt: string;
}

export interface ThreePointersMade {
  $numberInt: string;
}

export interface ThreePointersPercentage {
  $numberDouble: string;
}

export interface Turnovers {
  $numberInt: string;
}

export interface TwoPointersAttempted {
  $numberInt: string;
}

export interface TwoPointersMade {
  $numberInt: string;
}

export interface TwoPointersPercentage {
  $numberDouble: string;
}

export interface BiggestLead {
  $numberInt: string;
}

export interface BiggestScoringRun {
  $numberInt: string;
}

export interface FoulsBenchTechnical {
  $numberInt: string;
}

export interface PointsAgainst {
  $numberInt: string;
}

export interface PointsFromBench {
  $numberInt: string;
}

export interface ReboundsTeamDefensive {
  $numberInt: string;
}

export interface ReboundsTeamOffensive {
  $numberInt: string;
}

export interface ReboundsTeamTotal {
  $numberInt: string;
}

export interface TurnoversTeam {
  $numberInt: string;
}

export interface LeadChanges {
  $numberInt: string;
}

export interface TimeInLead {
  $numberDouble: string;
}

export interface TimesScoreLevel {
  $numberInt: string;
}

export interface Score {
  $numberInt: string;
}

export interface OteTeam {
  id: string;
  created_at: string;
  updated_at: string;
  synergy_id: string;
  name: string;
  school_name: any;
  image_path: any;
  logo_path: string;
  small_logo_path: any;
  white_logo_path: any;
  wordmark_image_path: string;
  primary_color: PrimaryColor;
  secondary_color: SecondaryColor;
  foreground_color: ForegroundColor;
  secondary_foreground_color: SecondaryForegroundColor;
  team_id: TeamId;
  team_code: string;
  team_code_long: any;
  is_current: boolean;
  description: string;
  instagram_url: string;
  tiktok_url: string;
  twitter_url: any;
  coach_name: string;
  coach_image_path: string;
  coach_image_placeholder_color: CoachImagePlaceholderColor;
  coach_hometown?: string;
  coach_biography?: string;
  coach_instagram_url: any;
  coach_twitter_url: any;
  slug: string;
}

export interface PrimaryColor {
  $numberInt: string;
}

export interface SecondaryColor {
  $numberInt: string;
}

export interface ForegroundColor {
  $numberInt: string;
}

export interface SecondaryForegroundColor {
  $numberInt: string;
}

export interface TeamId {
  $numberInt: string;
}

export interface CoachImagePlaceholderColor {
  $numberInt: string;
}

export interface OteGame {
  id: string;
  created_at: string;
  updated_at: string;
  latitude: string;
  longitude: string;
  address: string;
  street: any;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_hidden: boolean;
  is_stats_hidden: boolean;
  competition_name: string;
  purpose: any;
  match_id: number;
  synergy_id: string;
  game_category: string;
  match_time: any;
  match_time_zone: any;
  starts_at: string;
  starts_at_utc_offset: number;
  starts_at_timezone: string;
  ote_season_id: string;
  ote_event_id: string;
  ote_game_profile_id: string;
  youtube_id: string;
  prime_video_id: any;
  synergy_synced_at: string;
  expected_broadcast: string;
  location_name: any;
  game_clock: any;
  shot_clock: any;
  game_clock_is_running: boolean;
  period: any;
  period_status: string;
  period_type: any;
  status: string;
  google_calendar_id: string;
  google_calendar_synced_at: string;
  ote_season: OteSeason;
  ote_event: OteEvent;
  ote_games_ote_teams: OteGamesOteTeam[];
}

export interface OteSeason {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  synergy_id: string;
  starts_at: string;
  is_current: boolean;
  is_per_40: boolean;
  should_show_for_players: boolean;
  should_show_for_teams: boolean;
  should_show_for_schedule: boolean;
  should_show_for_leaders: boolean;
  should_show_for_standings: boolean;
}

export interface OteEvent {
  id: string;
  created_at: string;
  updated_at: string;
  starts_at: string;
  title: string;
  description: any;
  image_path: string;
  vivenu_id: string;
  cta_url: any;
  cta_text: any;
  is_sold_out: boolean;
}

export interface OteGameOteTeamPeriod {
  id: string;
  created_at: string;
  updated_at: string;
  period_id: number;
  ote_game_ote_team_id: string;
  assists_defensive: number;
  assists_turnover_ratio: number;
  assists: number;
  blocks_received: number;
  blocks: number;
  dunks: number;
  efficiency_custom: number;
  efficiency: number;
  fast_break_points_made: number;
  field_goals_attempted: number;
  field_goals_effective_percentage: number;
  field_goals_made: number;
  field_goals_percentage: number;
  fouls_coach_disqualifying: number;
  fouls_coach_technical: number;
  fouls_disqualifying: number;
  fouls_drawn: number;
  fouls_offensive: number;
  fouls_personal: number;
  fouls_technical: number;
  fouls_total: number;
  fouls_unsportsmanlike: number;
  free_throws_attempted: number;
  free_throws_made: number;
  free_throws_percentage: number;
  index_of_success: number;
  minutes: number;
  pir: number;
  points_fast_break_attempted: number;
  points_fast_break_made: number;
  points_fast_break: number;
  points_from_turnover: number;
  points_in_the_paint_attempted: number;
  points_in_the_paint_made: number;
  points_in_the_paint: number;
  points_second_chance_attempted: number;
  points_second_chance_made: number;
  points_second_chance: number;
  points_three_attempted: number;
  points_three_made: number;
  points_three_percentage: number;
  points_two_attempted: number;
  points_two_made: number;
  points_two_percentage: number;
  points: number;
  rebounds_defensive: number;
  rebounds_offensive: number;
  rebounds_total: number;
  second_chance_points_made: number;
  steals: number;
  three_pointers_attempted: number;
  three_pointers_made: number;
  three_pointers_percentage: number;
  true_shooting_attempts: number;
  true_shooting_percentage: number;
  turnovers_percentage: number;
  turnovers: number;
  two_pointers_attempted: number;
  two_pointers_made: number;
  two_pointers_percentage: number;
  biggest_lead: number;
  biggest_scoring_run: number;
  fouls_bench_technical: number;
  points_against: number;
  points_from_bench: number;
  rebounds_team_defensive: number;
  rebounds_team_offensive: number;
  rebounds_team_total: number;
  turnovers_team: number;
  lead_changes: number;
  time_in_lead: number;
  times_score_level: number;
  score: number;
}

export interface GameDetails {
  postgresId: string;
  created_at: string;
  updated_at: string;
  ote_game_id: string;
  ote_player_id: string;
  ote_team_id: string;
  assists_defensive?: number;
  assists_turnover_ratio?: number;
  assists?: number;
  blocks_received?: number;
  blocks?: number;
  dunks?: number;
  efficiency_custom?: number;
  efficiency: number;
  fast_break_points_made?: number;
  field_goals_attempted?: number;
  field_goals_effective_percentage?: number;
  field_goals_made?: number;
  field_goals_percentage?: number;
  fouls_coach_disqualifying?: number;
  fouls_coach_technical?: number;
  fouls_disqualifying?: number;
  fouls_drawn?: number;
  fouls_offensive?: number;
  fouls_personal?: number;
  fouls_technical?: number;
  fouls_total: number;
  fouls_unsportsmanlike?: number;
  free_throws_attempted?: number;
  free_throws_made: number;
  free_throws_percentage?: number;
  index_of_success: number;
  minutes?: number;
  pir: number;
  points_fast_break_attempted?: number;
  points_fast_break_made?: number;
  points_fast_break?: number;
  points_from_turnover?: number;
  points_in_the_paint_attempted?: number;
  points_in_the_paint_made?: number;
  points_in_the_paint?: number;
  points_second_chance_attempted?: number;
  points_second_chance_made?: number;
  points_second_chance?: number;
  points_three_attempted?: number;
  points_three_made?: number;
  points_three_percentage?: number;
  points_two_attempted?: number;
  points_two_made?: number;
  points_two_percentage?: number;
  points: number;
  rebounds_defensive?: number;
  rebounds_offensive?: number;
  rebounds_total?: number;
  second_chance_points_made?: number;
  steals?: number;
  three_pointers_attempted?: number;
  three_pointers_made?: number;
  three_pointers_percentage?: number;
  true_shooting_attempts: any;
  true_shooting_percentage: any;
  turnovers_percentage: any;
  turnovers?: number;
  two_pointers_attempted?: number;
  two_pointers_made?: number;
  two_pointers_percentage?: number;
  double_double: number;
  minus?: number;
  plus?: number;
  plus_minus?: number;
  triple_double: number;
  active: any;
  captain: boolean;
  did_not_play_reason: any;
  is_player: boolean;
  is_team_official: boolean;
  participated: boolean;
  playing_position: string;
  pno: string;
  shirt_number: string;
  starter: boolean;
  ote_player: OtePlayer;
}

export interface OtePlayer {
  id: string;
  created_at: string;
  updated_at: string;
  synergy_id: string;
  is_current: boolean;
  is_featured: boolean;
  is_ote: boolean;
  family_name: string;
  first_name: string;
  full_name: string;
  biography?: string;
  position: string;
  hometown?: string;
  jersey_number: string;
  height: number;
  weight: number;
  birthdate?: string;
  graduation_year: number;
  ote_team_id: string;
  image_path: string;
  hero_image_path: any;
  professional_team_id: any;
}
