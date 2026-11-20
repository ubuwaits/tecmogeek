import {
  DEFENSE_NOTE,
  DEFENSIVE_LINE_COLUMNS,
  KICKER_NOTE,
  KICKER_COLUMNS,
  LINEBACKER_COLUMNS,
  OFFENSIVE_LINE_COLUMNS,
  OFFENSIVE_LINE_NOTE,
  POSITION_PAGE_CONFIG_MAP,
  PUNTER_COLUMNS,
  PUNTER_NOTE,
  QB_COLUMNS,
  QB_NOTE,
  SECONDARY_COLUMNS,
} from "@/lib/players/config";
import type {
  TeamGroup,
  TeamSectionConfig,
  TeamSkillMode,
  TeamSkillModeConfig,
  TeamSlug,
} from "@/lib/types";

export const TEAM_GROUPS: readonly TeamGroup[] = [
  { title: "AFC East", teams: ["bills", "colts", "dolphins", "patriots", "jets"] },
  { title: "AFC Central", teams: ["bengals", "browns", "oilers", "steelers"] },
  { title: "AFC West", teams: ["broncos", "chiefs", "raiders", "chargers", "seahawks"] },
  { title: "NFC East", teams: ["redskins", "giants", "eagles", "cardinals", "cowboys"] },
  { title: "NFC Central", teams: ["bears", "lions", "packers", "vikings", "buccaneers"] },
  { title: "NFC West", teams: ["49ers", "rams", "saints", "falcons"] },
] as const satisfies readonly TeamGroup[];

export const TEAM_NAME_MAP: Record<TeamSlug, string> = {
  "49ers": "49ers",
  bears: "Bears",
  bengals: "Bengals",
  bills: "Bills",
  broncos: "Broncos",
  browns: "Browns",
  buccaneers: "Buccaneers",
  cardinals: "Cardinals",
  chargers: "Chargers",
  chiefs: "Chiefs",
  colts: "Colts",
  cowboys: "Cowboys",
  dolphins: "Dolphins",
  eagles: "Eagles",
  falcons: "Falcons",
  giants: "Giants",
  jets: "Jets",
  lions: "Lions",
  oilers: "Oilers",
  packers: "Packers",
  patriots: "Patriots",
  raiders: "Raiders",
  rams: "Rams",
  redskins: "Redskins",
  saints: "Saints",
  seahawks: "Seahawks",
  steelers: "Steelers",
  vikings: "Vikings",
};

export const TEAM_SLUG_SET: ReadonlySet<TeamSlug> = new Set(
  TEAM_GROUPS.flatMap((group) => group.teams),
);

export const TEAM_SECTION_CONFIGS: readonly TeamSectionConfig[] = [
  {
    id: "qb",
    range: [0, 1],
    rankingLabel: "QB Ranking",
    rankingTooltip: "Out of 56 QBs",
    note: QB_NOTE,
    playerPage: "qb",
    columns: QB_COLUMNS,
  },
  {
    id: "ol",
    range: [12, 16],
    rankingLabel: "OL Ranking",
    rankingTooltip: "Out of 140 OL",
    note: OFFENSIVE_LINE_NOTE,
    playerPage: "ol",
    columns: OFFENSIVE_LINE_COLUMNS,
  },
  {
    id: "dl",
    range: [17, 19],
    rankingLabel: "DL Ranking",
    rankingTooltip: "Out of 84 DL",
    note: DEFENSE_NOTE,
    playerPage: "dl",
    columns: DEFENSIVE_LINE_COLUMNS,
  },
  {
    id: "lb",
    range: [20, 23],
    rankingLabel: "LB Ranking",
    rankingTooltip: "Out of 112 LBs",
    note: DEFENSE_NOTE,
    playerPage: "lb",
    columns: LINEBACKER_COLUMNS,
  },
  {
    id: "secondary",
    range: [24, 27],
    rankingLabel: "CB/S Ranking",
    rankingTooltip: "Out of 112 CB & S",
    note: DEFENSE_NOTE,
    playerPage: "cb-s",
    columns: SECONDARY_COLUMNS,
  },
  {
    id: "k",
    range: [28, 28],
    rankingLabel: "K Ranking",
    rankingTooltip: "Out of 28 kickers",
    note: KICKER_NOTE,
    playerPage: "k",
    columns: KICKER_COLUMNS,
  },
  {
    id: "p",
    range: [29, 29],
    rankingLabel: "P Ranking",
    rankingTooltip: "Out of 28 punters",
    note: PUNTER_NOTE,
    playerPage: "p",
    columns: PUNTER_COLUMNS,
  },
];

function skillMode(
  id: TeamSkillMode,
  label: string,
  playerPage: TeamSkillModeConfig["playerPage"],
): TeamSkillModeConfig {
  const { rankingKey, ratingKey, columns, note } = POSITION_PAGE_CONFIG_MAP[playerPage];
  return { id, label, playerPage, rankingKey, ratingKey, columns, note };
}

export const TEAM_SKILL_MODE_CONFIG: Record<TeamSkillMode, TeamSkillModeConfig> = {
  rushing: skillMode("rushing", "Rushing", "rushers"),
  receiving: skillMode("receiving", "Receiving", "receivers"),
  "kick-return": skillMode("kick-return", "Kick Returning", "kick-returners"),
  "punt-return": skillMode("punt-return", "Punt Returning", "punt-returners"),
};

export const TEAM_SKILL_MODES = Object.values(TEAM_SKILL_MODE_CONFIG);

export const DEFAULT_TEAM_SKILL_MODE: TeamSkillMode = "rushing";
export const TEAM_SKILL_RANGE = [2, 11] as const;

export function isTeamSlug(slug: string): slug is TeamSlug {
  return TEAM_SLUG_SET.has(slug as TeamSlug);
}

export function getTeamLabel(slug: TeamSlug): string {
  return TEAM_NAME_MAP[slug];
}
