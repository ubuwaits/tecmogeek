import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { TEAM_GROUPS } from "@/data/divisions";
import { TEAM_SLUGS, type TeamData } from "@/lib/types";
import { getTeamLabel } from "@/lib/teams/config";
import { resolveTeamSlug } from "@/lib/teams/slugs.mts";

it("uses a recognized roster short name and otherwise falls back to the route", () => {
  expect(resolveTeamSlug("bills", "bears")).toBe("bills");
  expect(resolveTeamSlug("unknown", "bears")).toBe("bears");
});

it("includes each league team in exactly one division", () => {
  expect(TEAM_GROUPS.flatMap(group => group.teams).sort()).toEqual(TEAM_SLUGS);
});

it("derives each navigation label from its slug with the published roster spelling", () => {
  for (const slug of TEAM_SLUGS) {
    const roster: TeamData = JSON.parse(readFileSync(`data/${slug}.json`, "utf8"));
    expect(new Set(roster.players.map(player => player.team))).toEqual(new Set([getTeamLabel(slug)]));
  }
});
