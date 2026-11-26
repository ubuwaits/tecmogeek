import { describe, expect, it } from "vitest";

import { withReturnSpeeds } from "@/lib/players/return-speeds.mts";
import type { TeamData } from "@/lib/types";
import fortyNiners from "@/data/49ers.json";
import { leaderboard } from "../helpers/leaderboards";
import {
  getHeadshotSpriteIndex,
  getHomeEntries,
  getSortValue,
  matchesPrefixes,
  parsePercent,
  sortEntriesByKey,
} from "@/lib/players/utils";
import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";

const rushers = leaderboard("rushers");

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

  it("uses canonical ranking as the tie-breaker when rating values match", () => {
    const entries = [
      {
        team: "Bills",
        position: "RB1",
        name: "High Rank",
        number: "#1",
        rushing_rating: "40%",
        rushing_ranking: 100,
      },
      {
        team: "Bills",
        position: "RB2",
        name: "Low Rank",
        number: "#2",
        rushing_rating: "40%",
        rushing_ranking: 150,
      },
    ];

    const descending = sortEntriesByKey(entries, "rushing_rating", "desc", "rushing_ranking");
    const ascending = sortEntriesByKey(entries, "rushing_rating", "asc", "rushing_ranking");

    expect(descending.map((entry) => entry.rushing_ranking)).toEqual([100, 150]);
    expect(ascending.map((entry) => entry.rushing_ranking)).toEqual([150, 100]);
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
    const team: TeamData = structuredClone(fortyNiners);
    const enriched = withReturnSpeeds(team);
    expect(team).toEqual(fortyNiners);
    expect(enriched.players.find(player => player.position === "RB1")).toMatchObject({
      kick_return_maximum_speed: 31, punt_return_maximum_speed: 63,
    });
  });
});
