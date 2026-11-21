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
  rankingLabel: string,
): TeamSectionConfig {
  const { rankingGroupLabel, note } = POSITION_PAGE_CONFIG_MAP[playerPage];
  return { id, playerPage, rankingLabel, rankingGroupLabel, note };
}

export const TEAM_SECTION_CONFIGS: readonly TeamSectionConfig[] = [
  rosterSection("qb", "qb", "QB Ranking"),
  rosterSection("ol", "ol", "OL Ranking"),
  rosterSection("dl", "dl", "DL Ranking"),
  rosterSection("lb", "lb", "LB Ranking"),
  rosterSection("secondary", "cb-s", "CB/S Ranking"),
  rosterSection("k", "k", "K Ranking"),
  rosterSection("p", "p", "P Ranking"),
];

function skillMode(
  id: TeamSkillMode,
  label: string,
  playerPage: TeamSkillModeConfig["playerPage"],
): TeamSkillModeConfig {
  const { rankingKey, note } = POSITION_PAGE_CONFIG_MAP[playerPage];
  return { id, label, playerPage, rankingKey, note };
}

export const TEAM_SKILL_MODE_CONFIG: Record<TeamSkillMode, TeamSkillModeConfig> = {
  rushing: skillMode("rushing", "Rushing", "rushers"),
  receiving: skillMode("receiving", "Receiving", "receivers"),
  "kick-return": skillMode("kick-return", "Kick Returning", "kick-returners"),
  "punt-return": skillMode("punt-return", "Punt Returning", "punt-returners"),
};

export const TEAM_SKILL_MODES = Object.values(TEAM_SKILL_MODE_CONFIG);

export const DEFAULT_TEAM_SKILL_MODE: TeamSkillMode = "rushing";

export function getTeamLabel(slug: TeamSlug): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
