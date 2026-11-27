import type { PlayerRecord, PlayerSortKey, SortDirection } from "@/lib/types";
import { parsePercent } from "./rating.mts";

export function getSortValue(entry: PlayerRecord, key: PlayerSortKey): number {
  return parsePercent(entry[key]);
}

export function sortEntriesByKey<T extends PlayerRecord>(
  entries: readonly T[],
  key: PlayerSortKey,
  direction: SortDirection,
  tieBreakKey?: PlayerSortKey,
): T[] {
  return [...entries].sort((left, right) => {
    const leftValue = getSortValue(left, key);
    const rightValue = getSortValue(right, key);
    if (leftValue !== rightValue) {
      return direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
    }

    if (!tieBreakKey || tieBreakKey === key) return 0;
    const leftTieValue = getSortValue(left, tieBreakKey);
    const rightTieValue = getSortValue(right, tieBreakKey);
    return direction === "asc" ? rightTieValue - leftTieValue : leftTieValue - rightTieValue;
  });
}
