import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
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

function rosterSection(
  id: string,
  playerPage: TeamSectionConfig["playerPage"],
  range: TeamSectionConfig["range"],
  rankingLabel: string,
): TeamSectionConfig {
  const { rankingTooltip, note, columns } = POSITION_PAGE_CONFIG_MAP[playerPage];
  return { id, playerPage, range, rankingLabel, rankingTooltip, note, columns };
}

export const TEAM_SECTION_CONFIGS: readonly TeamSectionConfig[] = [
  rosterSection("qb", "qb", [0, 1], "QB Ranking"),
  rosterSection("ol", "ol", [12, 16], "OL Ranking"),
  rosterSection("dl", "dl", [17, 19], "DL Ranking"),
  rosterSection("lb", "lb", [20, 23], "LB Ranking"),
  rosterSection("secondary", "cb-s", [24, 27], "CB/S Ranking"),
  rosterSection("k", "k", [28, 28], "K Ranking"),
  rosterSection("p", "p", [29, 29], "P Ranking"),
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

export function resolveTeamSlug(shortName: string, routeSlug: TeamSlug): TeamSlug {
  return isTeamSlug(shortName) ? shortName : routeSlug;
}

export function getTeamLabel(slug: TeamSlug): string {
  return TEAM_NAME_MAP[slug];
}
