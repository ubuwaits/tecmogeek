import { expect, it } from "vitest";

import { getPositionPageConfig, POSITION_PAGES } from "@/lib/players/config";
import { POSITION_SLUGS } from "@/lib/types";

it("resolves exactly the configured player slugs", () => {
  expect(POSITION_PAGES.map(page => page.slug).sort()).toEqual([...POSITION_SLUGS].sort());
  for (const slug of POSITION_SLUGS) expect(getPositionPageConfig(slug)?.slug).toBe(slug);
  for (const slug of [...Object.getOwnPropertyNames(Object.prototype), "", "QB", "unknown", "qb/"]) {
    expect(getPositionPageConfig(slug)).toBeNull();
  }
});
