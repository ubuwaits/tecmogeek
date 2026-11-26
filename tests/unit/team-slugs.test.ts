import { readFileSync, readdirSync } from "node:fs";
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
  const rosters = readdirSync("data")
    .filter(name => name.endsWith(".json"))
    .filter(name => {
      const data = JSON.parse(readFileSync(`data/${name}`, "utf8"));
      return typeof data?.full_name === "string" && Array.isArray(data.players);
    })
    .map(name => name.slice(0, -5))
    .sort();
  expect(rosters).toHaveLength(28);
  expect(TEAM_GROUPS.flatMap(group => group.teams).sort()).toEqual(rosters);
  expect(TEAM_SLUGS).toEqual(rosters);
});

it("derives each navigation label from its slug with the published roster spelling", () => {
  for (const slug of TEAM_SLUGS) {
    const roster: TeamData = JSON.parse(readFileSync(`data/${slug}.json`, "utf8"));
    expect(roster.full_name.endsWith(" " + getTeamLabel(slug))).toBe(true);
  }
});

it("stores team identity and return speeds only at their source", () => {
  for (const slug of TEAM_SLUGS) {
    const roster: TeamData = JSON.parse(readFileSync(`data/${slug}.json`, "utf8"));
    expect(roster).not.toHaveProperty("short_name");
    for (const player of roster.players) {
      for (const field of ["team", "teamSlug", "kick_return_maximum_speed", "punt_return_maximum_speed"]) {
        expect(player, `${slug}/${player.position}`).not.toHaveProperty(field);
      }
    }
  }
});
