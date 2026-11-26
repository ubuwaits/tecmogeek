import assert from "node:assert/strict";
import { positionEntries } from "../../../lib/players/leaderboard.ts";
import { key, positions } from "../roster-data.mjs";

function identities(players, source) {
  const ids = new Set(players.map(key));
  assert.equal(ids.size, players.length, `Duplicate player in ${source}`);
  return ids;
}

export function verifiedLeaderboards(roster, pages) {
  const unclassified = identities(roster, "team rosters");
  const groups = pages.map(page => {
    // Eligibility is specified independently of the production leaderboard selector.
    const eligible = roster.filter(player => positions[page.slug].test(player.position));
    assert(eligible.length > 0, `Empty group: ${page.slug}`);
    const rows = positionEntries(roster, page);
    const ids = identities(rows, page.slug);
    assert.deepEqual(ids, new Set(eligible.map(key)), `Coverage mismatch in ${page.slug}`);
    for (const id of ids) unclassified.delete(id);
    return { page, eligible, rows };
  });
  assert.equal(unclassified.size, 0, `Unclassified roster players: ${[...unclassified].join(", ")}`);
  return groups;
}
