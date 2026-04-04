export const TEAM_SLUGS = [
  "49ers",
  "bears",
  "bengals",
  "bills",
  "broncos",
  "browns",
  "buccaneers",
  "cardinals",
  "chargers",
  "chiefs",
  "colts",
  "cowboys",
  "dolphins",
  "eagles",
  "falcons",
  "giants",
  "jets",
  "lions",
  "oilers",
  "packers",
  "patriots",
  "raiders",
  "rams",
  "redskins",
  "saints",
  "seahawks",
  "steelers",
  "vikings",
] as const;

export const POSITION_SLUGS = [
  "qb",
  "rushers",
  "receivers",
  "kick-returners",
  "punt-returners",
  "ol",
  "dl",
  "lb",
  "cb-s",
  "k",
  "p",
] as const;

export const HEADSHOT_POSITIONS = [
  "QB1",
  "QB2",
  "RB1",
  "RB2",
  "RB3",
  "RB4",
  "WR1",
  "WR2",
  "WR3",
  "WR4",
  "TE1",
  "TE2",
  "C",
  "LG",
  "RG",
  "LT",
  "RT",
  "RE",
  "NT",
  "LE",
  "ROLB",
  "RILB",
  "LILB",
  "LOLB",
  "RCB",
  "LCB",
  "FS",
  "SS",
  "K",
  "P",
] as const;

export type TeamSlug = (typeof TEAM_SLUGS)[number];
export type PositionSlug = (typeof POSITION_SLUGS)[number];
export type HeadshotPosition = (typeof HEADSHOT_POSITIONS)[number];
export type SortDirection = "asc" | "desc";
export type TeamSkillMode = "rushing" | "receiving" | "kick-return" | "punt-return";

export type PlayerMetricKey =
  | "running_speed"
  | "rushing_power"
  | "maximum_speed"
  | "kick_return_maximum_speed"
  | "punt_return_maximum_speed"
  | "passing_speed"
  | "pass_control"
  | "avoid_pass_block"
  | "hitting_power"
  | "ball_control"
  | "receptions"
  | "pass_interceptions"
  | "kicking_ability"
  | "avoid_kick_block";

export type PlayerSortKey =
  | PlayerMetricKey
  | "ranking"
  | "rating"
  | "rushing_ranking"
  | "rushing_rating"
  | "receiving_ranking"
  | "receiving_rating"
  | "kick_return_ranking"
  | "kick_return_rating"
  | "punt_return_ranking"
  | "punt_return_rating";

export interface PlayerRecord {
  team: string;
  position: string;
  name: string;
  number: string;
  ranking?: number;
  rating?: string;
  running_speed?: number;
  rushing_power?: number;
  maximum_speed?: number;
  kick_return_maximum_speed?: number;
  punt_return_maximum_speed?: number;
  passing_speed?: number;
  pass_control?: number;
  avoid_pass_block?: number;
  hitting_power?: number;
  ball_control?: number;
  receptions?: number;
  pass_interceptions?: number;
  kicking_ability?: number;
  avoid_kick_block?: number;
  rushing_ranking?: number;
  rushing_rating?: string;
  receiving_ranking?: number;
  receiving_rating?: string;
  kick_return_ranking?: number;
  kick_return_rating?: string;
  punt_return_ranking?: number;
  punt_return_rating?: string;
  [key: string]: string | number | undefined;
}

export interface TeamData {
  full_name: string;
  short_name: TeamSlug | string;
  players: PlayerRecord[];
}

export interface OffensiveSkillLineupRecord {
  RB1: string;
  RB2: string;
  WR1: string;
  WR2: string;
  TE1: string;
}

export interface TeamRatingComponents {
  qb_room: number;
  qb_rating: number;
  return_room: number;
  ol_line: number;
  running_skill: number;
  passing_skill: number;
  balanced_skill: number;
  running_offense: number;
  passing_offense: number;
  balanced_offense: number;
  dl_group: number;
  lb_group: number;
  secondary_group: number;
}

export interface TeamRatingSelectedLineups {
  best_qb: string;
  backup_qb: string;
  running_lineup: OffensiveSkillLineupRecord;
  passing_lineup: OffensiveSkillLineupRecord;
  balanced_lineup: OffensiveSkillLineupRecord;
  kr: string;
  pr: string;
}

export interface TeamRatingRecord {
  team: TeamSlug;
  full_name: string;
  offensive_rating: number;
  defensive_rating: number;
  overall_rating: number;
  components: TeamRatingComponents;
  selected_lineups: TeamRatingSelectedLineups;
}

export interface TeamGroup {
  title: string;
  teams: readonly TeamSlug[];
}

export interface MetricColumn {
  key: PlayerMetricKey;
  label: string;
  tooltip: string;
  weight: number;
}

export interface FilterOption {
  id: string;
  label: string;
  allowedPrefixes: readonly string[];
}

export interface PositionPageConfig {
  slug: PositionSlug;
  title: string;
  navLabel: string;
  homeLabel: string;
  dataFile: string;
  note: string;
  rankingKey: PlayerSortKey;
  ratingKey: PlayerSortKey;
  rankingTooltip: string;
  columns: readonly MetricColumn[];
  homeLimit: number;
  homeExcludePositions?: readonly string[];
  filters?: readonly FilterOption[];
  defaultFilterId?: string;
}

export interface TeamSectionConfig {
  id: string;
  range: readonly [number, number];
  rankingLabel: string;
  rankingTooltip: string;
  note: string;
  playerPage: PositionSlug;
  columns: readonly MetricColumn[];
}

export interface TeamSkillModeConfig {
  id: TeamSkillMode;
  label: string;
  note: string;
  playerPage: PositionSlug;
  rankingKey: PlayerSortKey;
  ratingKey: PlayerSortKey;
  columns: readonly MetricColumn[];
}
