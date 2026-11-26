import { describe, expect, it } from "vitest";

import { getNextSortState } from "@/lib/shared/sort-state";
import type { SortDirection } from "@/lib/types";

const orderFor = (direction: SortDirection) => direction === "asc" ? [1, 2, 3] : [3, 2, 1];

describe("table sort state", () => {
  it.each([["desc", "asc"], ["asc", "desc"]] as const)(
    "toggles the active column from %s to %s without sorting again",
    (direction, expected) => {
      expect(getNextSortState({
        current: { key: "rating", direction },
        nextKey: "rating",
        defaultDirection: "desc",
        currentOrder: [1, 3, 2],
        orderFor: () => { throw new Error("Repeated clicks should skip sorting"); },
      })).toEqual({ key: "rating", direction: expected });
    },
  );

  it.each([
    { currentOrder: [1, 3, 2], defaultDirection: "asc", expected: "asc" },
    { currentOrder: [1, 3, 2], defaultDirection: "desc", expected: "desc" },
    { currentOrder: [1, 2, 3], defaultDirection: "asc", expected: "desc" },
    { currentOrder: [3, 2, 1], defaultDirection: "desc", expected: "asc" },
  ] as const)("selects the new column and its direction given $currentOrder and default $defaultDirection",
    ({ currentOrder, defaultDirection, expected }) => {
      expect(getNextSortState({
        current: { key: "rating", direction: "desc" },
        nextKey: "ranking",
        defaultDirection,
        currentOrder,
        orderFor,
      })).toEqual({ key: "ranking", direction: expected });
    });
});
