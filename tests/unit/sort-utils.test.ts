import { describe, expect, it } from "vitest";

import { getNextSortDirection } from "@/lib/sort-utils";

describe("sort utilities", () => {
  it("toggles the active column direction on repeated clicks", () => {
    expect(
      getNextSortDirection({
        currentKey: "rating",
        nextKey: "rating",
        currentDirection: "desc",
        defaultDirection: "desc",
      }),
    ).toBe("asc");

    expect(
      getNextSortDirection({
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
        currentKey: "rating",
        nextKey: "ranking",
        currentDirection: "desc",
        defaultDirection: "asc",
      }),
    ).toBe("asc");

    expect(
      getNextSortDirection({
        currentKey: "ranking",
        nextKey: "receptions",
        currentDirection: "asc",
        defaultDirection: "desc",
      }),
    ).toBe("desc");
  });
});
