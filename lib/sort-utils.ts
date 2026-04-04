import type { SortDirection } from "@/lib/types";

export function getNextSortDirection<Key extends string>({
  currentKey,
  nextKey,
  currentDirection,
  defaultDirection,
}: {
  currentKey: Key;
  nextKey: Key;
  currentDirection: SortDirection;
  defaultDirection: SortDirection;
}): SortDirection {
  if (currentKey === nextKey) {
    return currentDirection === "desc" ? "asc" : "desc";
  }

  return defaultDirection;
}
