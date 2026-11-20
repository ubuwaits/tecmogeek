import { expect, it } from "vitest";
import { resolveTeamSlug } from "@/lib/teams/config";

it("uses a recognized roster short name and otherwise falls back to the route", () => {
  expect(resolveTeamSlug("bills", "bears")).toBe("bills");
  expect(resolveTeamSlug("unknown", "bears")).toBe("bears");
});
