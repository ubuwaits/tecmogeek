import assert from "node:assert/strict";
import { TEAM_SLUGS } from "../../../lib/teams/slugs.mts";
import { read } from "../roster-data.mjs";
import { verifyTeamRounding } from "./verify-team-rounding.mjs";

assert.equal(TEAM_SLUGS.length, 28);
let count = 0;
const ties = [];
for (const slug of TEAM_SLUGS) {
  const checked = verifyTeamRounding(slug, read(slug + ".json"));
  count += checked.count;
  ties.push(...checked.ties);
}
console.table(ties);
console.log(`Checked ${count} values, ${ties.length} exact ties, ${ties.filter(t => t.stored !== t.halfUp).length} below half-up.`);
