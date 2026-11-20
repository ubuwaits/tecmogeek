import { TEAM_GROUPS } from "@/data/divisions";
import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import type {
  TeamSectionConfig,
  TeamSkillMode,
  TeamSkillModeConfig,
  TeamSlug,
} from "@/lib/types";

export const TEAM_SLUG_SET: ReadonlySet<TeamSlug> = new Set(
  TEAM_GROUPS.flatMap((group) => group.teams),
);

function rosterSection(
  id: string,
  playerPage: TeamSectionConfig["playerPage"],
  range: TeamSectionConfig["range"],
  rankingLabel: string,
): TeamSectionConfig {
  const { rankingGroupLabel, note, columns } = POSITION_PAGE_CONFIG_MAP[playerPage];
  return { id, playerPage, range, rankingLabel, rankingGroupLabel, note, columns };
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
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
