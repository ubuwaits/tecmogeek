import { POSITION_PAGE_CONFIG_MAP } from "@/lib/site-config";
import type {
  PlayerRecord,
  PlayerSortKey,
  PositionPageConfig,
  TeamData,
  TeamSlug,
  SortDirection,
} from "@/lib/types";

export function parsePercent(value: string | number | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  return Number.parseFloat(value.replace("%", "")) || 0;
}

export function getSortValue(entry: PlayerRecord, key: PlayerSortKey): number {
  const value = entry[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return parsePercent(value);
  }

  return 0;
}

export function sortEntriesByKey<T extends PlayerRecord>(
  entries: readonly T[],
  key: PlayerSortKey,
  direction: SortDirection,
): T[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) => {
      const leftValue = getSortValue(left.entry, key);
      const rightValue = getSortValue(right.entry, key);

      if (leftValue === rightValue) {
        return left.index - right.index;
      }

      return direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
    })
    .map(({ entry }) => entry);
}

export function matchesPrefixes(position: string, prefixes: readonly string[]): boolean {
  if (prefixes.length === 0) {
    return true;
  }

  return prefixes.some((prefix) => position.startsWith(prefix));
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

export function getHomeEntriesForSlug(slug: keyof typeof POSITION_PAGE_CONFIG_MAP, entries: readonly PlayerRecord[]) {
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
