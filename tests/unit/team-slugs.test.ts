import { expect, it } from "vitest";
import { TEAM_GROUPS } from "@/data/divisions";
import { TEAM_SLUGS } from "@/lib/types";
import { resolveTeamSlug } from "@/lib/teams/config";

it("uses a recognized roster short name and otherwise falls back to the route", () => {
  expect(resolveTeamSlug("bills", "bears")).toBe("bills");
  expect(resolveTeamSlug("unknown", "bears")).toBe("bears");
});

it("includes each league team in exactly one division", () => {
  expect(TEAM_GROUPS.flatMap(group => group.teams).sort()).toEqual(TEAM_SLUGS);
});
