import { describe, expect, it } from "vitest";

import fortyNiners from "@/data/49ers.json";
import rushers from "@/data/rushers.json";
import {
  getHeadshotSpriteIndex,
  getHomeEntries,
  getSortValue,
  getTeamReturnSpeedValues,
  matchesPrefixes,
  parsePercent,
  sortEntriesByKey,
} from "@/lib/player-utils";
import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";

describe("player utilities", () => {
  it("parses percentage strings into numeric sort values", () => {
    expect(parsePercent("87%")).toBe(87);
    expect(parsePercent("52.76%")).toBeCloseTo(52.76);
    expect(parsePercent(undefined)).toBe(0);
    expect(
      getSortValue(
        { team: "Bills", position: "QB1", name: "QB Bills", number: "#0", rating: "75%" },
        "rating",
      ),
    ).toBe(75);
  });

  it("sorts descending for rating values while preserving highest player first", () => {
    const sorted = sortEntriesByKey(rushers.slice(0, 10), "rushing_rating", "desc");
    expect(sorted[0]?.name).toBe("Bo Jackson");
    expect(sorted[0]?.rushing_rating).toBe("82%");
  });

  it("keeps the homepage rusher quirk that excludes WR2 and WR3 from the first nine rows", () => {
    const entries = getHomeEntries(POSITION_PAGE_CONFIG_MAP.rushers, rushers);
    expect(entries).toHaveLength(5);
    expect(entries.some((entry) => entry.position === "WR2" || entry.position === "WR3")).toBe(false);
  });

  it("matches filter prefixes for rushers and receivers", () => {
    expect(matchesPrefixes("RB3", ["RB"])).toBe(true);
    expect(matchesPrefixes("WR2", ["RB"])).toBe(false);
    expect(matchesPrefixes("TE1", ["WR", "TE"])).toBe(true);
  });

  it("maps extended wide receiver slots onto the shared headshot sprite positions", () => {
    expect(getHeadshotSpriteIndex("WR5")).toBe(10);
    expect(getHeadshotSpriteIndex("WR6")).toBe(11);
    expect(getHeadshotSpriteIndex("TE1")).toBe(10);
    expect(getHeadshotSpriteIndex("TE2")).toBe(11);
    expect(getHeadshotSpriteIndex("C")).toBe(12);
  });

  it("derives team return speeds from RT and SS slots", () => {
    expect(getTeamReturnSpeedValues(fortyNiners)).toEqual({
      kickReturnMaximumSpeed: 31,
      puntReturnMaximumSpeed: 63,
    });
  });
});
