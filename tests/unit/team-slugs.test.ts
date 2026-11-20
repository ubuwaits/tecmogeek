import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { TEAM_GROUPS } from "@/data/divisions";
import { TEAM_SLUGS, type TeamData } from "@/lib/types";
import { getTeamLabel } from "@/lib/teams/config";
import { isTeamSlug } from "@/lib/teams/slugs.mts";

it("recognizes only configured team slugs", () => {
  for (const slug of TEAM_SLUGS) expect(isTeamSlug(slug)).toBe(true);
  expect(isTeamSlug("unknown")).toBe(false);
});

it("includes each league team in exactly one division", () => {
  expect(TEAM_GROUPS.flatMap(group => group.teams).sort()).toEqual(TEAM_SLUGS);
});

it("derives each navigation label from its slug with the published roster spelling", () => {
  for (const slug of TEAM_SLUGS) {
    const roster: TeamData = JSON.parse(readFileSync(`data/${slug}.json`, "utf8"));
    expect(roster.full_name.endsWith(" " + getTeamLabel(slug))).toBe(true);
  }
});
