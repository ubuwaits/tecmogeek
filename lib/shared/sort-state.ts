import type { SortDirection } from "@/lib/types";

export type SortState<Key extends string> = { key: Key; direction: SortDirection };

export function getNextSortState<Key extends string, Row>({
  current,
  nextKey,
  defaultDirection,
  currentOrder,
  orderFor,
}: {
  current: SortState<Key>;
  nextKey: Key;
  defaultDirection: SortDirection;
  currentOrder: readonly Row[];
  orderFor: (direction: SortDirection) => readonly Row[];
}): SortState<Key> {
  if (current.key === nextKey) {
    return { key: nextKey, direction: current.direction === "desc" ? "asc" : "desc" };
  }

  function matches(direction: SortDirection) {
    const order = orderFor(direction);
    return currentOrder.length === order.length && currentOrder.every((row, i) => row === order[i]);
  }
  if (matches("desc")) return { key: nextKey, direction: "asc" };
  if (matches("asc")) return { key: nextKey, direction: "desc" };
  return { key: nextKey, direction: defaultDirection };
}
