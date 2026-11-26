import { TEAM_SLUGS } from "../../../lib/teams/slugs.mts";
import { buildTeamRatingRecord } from "../../../lib/teams/calculate-ratings.mts";
import assert from "node:assert/strict";
import { verifyTeamRounding } from "../teams/verify-team-rounding.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { withReturnSpeeds } from "../../../lib/players/return-speeds.mts";
import { predictRosterEdit, rosterEdits } from "./predict-edit.mjs";
import { skillPositions } from "../roster-data.mjs";

function assertRebuiltTeam(slug, originalTeam, team, rebuilt, edit) {
  const record = buildTeamRatingRecord(slug, originalTeam);
  assert.deepEqual(rebuilt, team, record.team);
  if (edit.position === "RT") {
    const kickSpeed = team.players.find(player => player.position === "RT").maximum_speed;
    const puntSpeed = team.players.find(player => player.position === "SS").maximum_speed;
    const enriched = withReturnSpeeds(rebuilt);
    for (const player of enriched.players.filter(p => skillPositions.test(p.position))) {
      assert.equal(player.kick_return_maximum_speed, kickSpeed);
      assert.equal(player.punt_return_maximum_speed, puntSpeed);
    }
  }
  const kickReturner = team.players.filter(p => skillPositions.test(p.position))
    .sort((a, b) => parseInt(b.kick_return_rating) - parseInt(a.kick_return_rating))[0];
  record.selected_lineups.kr = `${kickReturner.name} (${kickReturner.position})`;
  const actual = buildTeamRatingRecord(record.team, rebuilt);
  verifyTeamRounding(slug, rebuilt, actual);
  // Other numeric fields and selections must also match the baseline.
  const changed = edit.position === "RT"
    ? ["ol_line", "return_room", "running_offense", "passing_offense", "balanced_offense", "offensive_rating", "overall_rating"]
    : ["dl_group", "defensive_rating", "overall_rating"];
  for (const field of changed) {
    if (field in record.components) record.components[field] = actual.components[field];
    else record[field] = actual[field];
  }
  assert.deepEqual(actual, record, record.team);
}

export function verifyRosterEdits(checkout, baseline, runRebuilds, listFiles) {
  const directory = path.join(checkout, "data");
  const file = name => path.join(directory, name);
  const baselineRosters = new Map(TEAM_SLUGS.map(slug => [slug, JSON.parse(baseline.get(slug + ".json"))]));
  for (const edit of rosterEdits) {
    const { editedRoster, expectedRosters } = predictRosterEdit(baselineRosters, edit);
    for (const [name, bytes] of baseline) writeFileSync(file(name), bytes);
    writeFileSync(file(edit.team + ".json"), JSON.stringify(editedRoster));
    runRebuilds();

    assert.deepEqual(new Set(listFiles(directory)), new Set(baseline.keys()));
    for (const [slug, team] of expectedRosters) {
      const rebuilt = JSON.parse(readFileSync(file(slug + ".json")));
      assertRebuiltTeam(slug, baselineRosters.get(slug), team, rebuilt, edit);
    }
    const rebuiltFiles = new Set(TEAM_SLUGS.map(slug => slug + ".json"));
    for (const [name, bytes] of baseline) {
      if (!rebuiltFiles.has(name)) {
        assert(readFileSync(file(name)).equals(bytes), name);
      }
    }
    console.log(`Verified Eagles ${edit.position} ${edit.attribute} edit across all ${expectedRosters.size} teams.`);
  }
}
