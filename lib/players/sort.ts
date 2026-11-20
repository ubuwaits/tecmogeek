import type { PlayerRecord, PlayerSortKey, SortDirection } from "@/lib/types";

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
  tieBreakKey?: PlayerSortKey,
): T[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) => {
      const leftValue = getSortValue(left.entry, key);
      const rightValue = getSortValue(right.entry, key);

      if (leftValue === rightValue) {
        if (tieBreakKey && tieBreakKey !== key) {
          const leftTieValue = getSortValue(left.entry, tieBreakKey);
          const rightTieValue = getSortValue(right.entry, tieBreakKey);

          if (leftTieValue !== rightTieValue) {
            return direction === "asc" ? rightTieValue - leftTieValue : leftTieValue - rightTieValue;
          }
        }

        return left.index - right.index;
      }

      return direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
    })
    .map(({ entry }) => entry);
}
