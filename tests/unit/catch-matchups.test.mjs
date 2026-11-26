import assert from "node:assert/strict";
import { it } from "vitest";
import { catchRows, catchTeam } from "../../lib/players/catch-matchups";
import { readTeamRosters } from "../../scripts/rebuild/roster-files.mts";

// Count the rolls at or above the first successful byte, independently of the game's roll loop.
function expectedChance(qb, receiver, defender) {
  const level = displayed => Math.round(displayed * 16 / 100) - 1;
  const pass = 61 + 2 * level(qb.pass_control);
  const catchSkill = 61 + 2 * level(receiver.receptions);
  const block = defender ? 51 + 2 * level(defender.pass_interceptions) : 0;
  const first = Math.ceil((defender ? 80 : 79) * 256 / (pass + catchSkill - block));
  return Math.max(0, 256 - Math.max(first, 128)) * 100 / 128;
}

it("checks all 188,160 open and covered cells against raw roster attributes", () => {
  const teams = [...readTeamRosters()].map(([slug, roster]) => {
    const team = catchTeam(slug, roster);
    const roles = [
      ["quarterbacks", /^QB[12]$/, "pass_control"],
      ["receivers", /^(RB|WR|TE)\d+$/, "receptions"],
      ["defenders", /^(RE|NT|LE|ROLB|RILB|LILB|LOLB|RCB|LCB|FS|SS)$/, "pass_interceptions"],
    ];
    for (const [role, positions, attribute] of roles) {
      assert.deepEqual(team[role], roster.players.filter(p => positions.test(p.position))
        .map(p => ({ name: p.name, position: p.position, skill: p[attribute] })));
    }
    return { team, slots: new Map(roster.players.map(p => [p.position, p])) };
  });
  let count = 0;
  for (const offense of teams) for (const defense of teams) {
    for (const qb of offense.team.quarterbacks) {
      const rows = catchRows(qb, offense.team.receivers, defense.team.defenders);
      assert.deepEqual(rows.map(row => row.receiver), offense.team.receivers);
      for (const { receiver, open, covered } of rows) {
        const passer = offense.slots.get(qb.position);
        const target = offense.slots.get(receiver.position);
        const label = `${offense.team.slug}/${qb.name}/${receiver.name} against ${defense.team.slug}`;
        assert.equal(open, expectedChance(passer, target), label + " open");
        count++;
        assert.deepEqual(Object.keys(covered), defense.team.defenders.map(d => d.position));
        for (const defender of defense.team.defenders) {
          assert.equal(covered[defender.position], expectedChance(passer, target, defense.slots.get(defender.position)),
            label + "/" + defender.name);
          count++;
        }
      }
    }
  }
  assert.equal(count, 188160);
});
