import { describe, expect, it } from "vitest";

import { getNextSortDirection } from "@/lib/shared/sort-direction";

describe("sort utilities", () => {
  it("toggles the active column direction on repeated clicks", () => {
    expect(
      getNextSortDirection({
        currentOrder: [1, 3, 2],
        orderFor: () => { throw new Error("Repeated clicks should skip sorting"); },
        currentKey: "rating",
        nextKey: "rating",
        currentDirection: "desc",
        defaultDirection: "desc",
      }),
    ).toBe("asc");

    expect(
      getNextSortDirection({
        currentOrder: [1, 3, 2],
        orderFor: () => { throw new Error("Repeated clicks should skip sorting"); },
        currentKey: "rating",
        nextKey: "rating",
        currentDirection: "asc",
        defaultDirection: "desc",
      }),
    ).toBe("desc");
  });

  it("resets to the clicked column's default direction when switching columns", () => {
    expect(
      getNextSortDirection({
        currentOrder: [1, 3, 2],
        orderFor: direction => direction === "asc" ? [1, 2, 3] : [3, 2, 1],
        currentKey: "rating",
        nextKey: "ranking",
        currentDirection: "desc",
        defaultDirection: "asc",
      }),
    ).toBe("asc");

    expect(
      getNextSortDirection({
        currentOrder: [1, 3, 2],
        orderFor: direction => direction === "asc" ? [1, 2, 3] : [3, 2, 1],
        currentKey: "ranking",
        nextKey: "receptions",
        currentDirection: "asc",
        defaultDirection: "desc",
      }),
    ).toBe("desc");
  });
});
