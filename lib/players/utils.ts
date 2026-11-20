import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import type {
  HeadshotPosition,
  PlayerRecord,
  PositionPageConfig,
  PositionSlug,
} from "@/lib/types";
import { HEADSHOT_POSITIONS } from "@/lib/types";

export { getSortValue, parsePercent, sortEntriesByKey } from "@/lib/players/sort";

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

export function getHomeEntries<T extends PlayerRecord>(
  config: PositionPageConfig,
  entries: readonly T[],
): T[] {
  const limited = entries.slice(0, config.homeLimit);

  if (!config.homeExcludePositions?.length) {
    return limited;
  }

  return limited.filter((entry) => !config.homeExcludePositions?.includes(entry.position));
}

export function getHomeEntriesForSlug(slug: PositionSlug, entries: readonly PlayerRecord[]) {
  return getHomeEntries(POSITION_PAGE_CONFIG_MAP[slug], entries);
}

export function rankingTooltip(count: number, groupLabel: string): string {
  return `Out of ${count} ${groupLabel}`;
}
