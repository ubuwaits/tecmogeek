import { expect, it } from "vitest";

import { POSITION_PAGE_CONFIG_MAP } from "@/lib/players/config";
import { TEAM_SECTION_CONFIGS } from "@/lib/teams/config";

it.each([
  ["k", "Avoid Kick Block has no effect on performance"],
  ["p", "Punts cannot be blocked"],
] as const)("documents Kicking Ability and links the %s roster section to its leaderboard", (slug, note) => {
  const page = POSITION_PAGE_CONFIG_MAP[slug];
  expect(page.note).toContain(note);
  expect(page.columns).toEqual([
    { key: "kicking_ability", label: "KA", tooltip: "Kicking Ability", weight: 100 },
  ]);
  expect(TEAM_SECTION_CONFIGS.find(section => section.id === slug)?.playerPage).toBe(slug);
});
