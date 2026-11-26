import assert from "node:assert/strict";
import { it } from "vitest";
import { getRankedTeamRows } from "../../lib/teams/ratings.ts";

function permutations(items) {
  if (items.length === 0) return [[]];
  return items.flatMap(item =>
    permutations(items.filter(other => other !== item)).map(rest => [item, ...rest]));
}

it("keeps each team's descending rank through ties, display rounding, and every input order", () => {
  // Alphabetical order within a score group is part of the expected result.
  const teams = [
    { team: "bills", full_name: "Buffalo Bills" },
    { team: "bears", full_name: "Chicago Bears" },
    { team: "eagles", full_name: "Philadelphia Eagles" },
    { team: "49ers", full_name: "San Francisco 49ers" },
  ];
  const scores = [61, 61.001, 61.2]; // The first two display as 61.0%.
  const assignments = teams.reduce(
    combinations => combinations.flatMap(previous => scores.map(score => [...previous, score])), [[]]);
  const orders = permutations(teams.map((_, i) => i));
  let standings = 0;

  for (const assignment of assignments) {
    const entries = teams.map((team, i) => ({ ...team, overall_rating: assignment[i] }));
    const groups = scores.map(score => entries.filter(team => team.overall_rating === score));
    const descending = groups.toReversed().flat();
    const rank = new Map(descending.map((team, index) => [team.team, index + 1]));
    const expected = { asc: groups.flat(), desc: descending };

    for (const order of orders) {
      const input = order.map(i => entries[i]);
      for (const direction of ["asc", "desc"]) {
        const actual = getRankedTeamRows(input, "overall_rating", direction);
        assert.deepEqual(actual.map(row => [row.team.team, row.rank]),
          expected[direction].map(team => [team.team, rank.get(team.team)]),
          `${direction}, scores [${assignment}], input order [${input.map(team => team.team)}]`);
      }
      standings++;
    }
  }
  assert.equal(standings, 1944);
});
