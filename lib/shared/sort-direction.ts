import type { SortDirection } from "@/lib/types";

export function getNextSortDirection<Key extends string, Row>({
  currentKey,
  nextKey,
  currentDirection,
  defaultDirection,
  currentOrder,
  orderFor,
}: {
  currentKey: Key;
  nextKey: Key;
  currentDirection: SortDirection;
  defaultDirection: SortDirection;
  currentOrder: readonly Row[];
  orderFor: (direction: SortDirection) => readonly Row[];
}): SortDirection {
  if (currentKey === nextKey) {
    return currentDirection === "desc" ? "asc" : "desc";
  }

  function matches(direction: SortDirection) {
    const order = orderFor(direction);
    return currentOrder.length === order.length && currentOrder.every((row, i) => row === order[i]);
  }
  if (matches("desc")) return "asc";
  if (matches("asc")) return "desc";
  return defaultDirection;
}
