import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import type {
  HeadshotPosition,
  PlayerRecord,
  PositionPageConfig,
  PositionSlug,
  TeamData,
  TeamSlug,
} from "@/lib/types";
import { HEADSHOT_POSITIONS } from "@/lib/types";

export { getSortValue, parsePercent, sortEntriesByKey } from "@/lib/player-sort";

export function matchesPrefixes(position: string, prefixes: readonly string[]): boolean {
  if (prefixes.length === 0) {
    return true;
  }

  return prefixes.some((prefix) => position.startsWith(prefix));
}

export function getHeadshotSpriteIndex(position: string): number {
  if (position === "WR5") {
    return 10;
  }

  if (position === "WR6") {
    return 11;
  }

  const index = HEADSHOT_POSITIONS.indexOf(position as HeadshotPosition);

  return index >= 0 ? index : 0;
}

export function getHomeEntries(
  config: PositionPageConfig,
  entries: readonly PlayerRecord[],
): PlayerRecord[] {
  const limited = entries.slice(0, config.homeLimit);

  if (!config.homeExcludePositions?.length) {
    return limited;
  }

  return limited.filter((entry) => !config.homeExcludePositions?.includes(entry.position));
}

export function getHomeEntriesForSlug(slug: PositionSlug, entries: readonly PlayerRecord[]) {
  return getHomeEntries(POSITION_PAGE_CONFIG_MAP[slug], entries);
}

export function getTeamSlugFromCode(value: string): TeamSlug {
  return value.toLowerCase() as TeamSlug;
}

export function getTeamReturnSpeedValues(team: TeamData) {
  const rt = team.players.find((player) => player.position === "RT");
  const ss = team.players.find((player) => player.position === "SS");

  return {
    kickReturnMaximumSpeed: rt?.maximum_speed ?? 0,
    puntReturnMaximumSpeed: ss?.maximum_speed ?? 0,
  };
}
