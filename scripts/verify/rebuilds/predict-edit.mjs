import assert from "node:assert/strict";

import { exactPlayerRating, expectedWeights } from "../players/rating-spec.mjs";
import { positions, skillPositions } from "../roster-data.mjs";

function rateGroup(players, slug, ratingKey, rankingKey) {
  const fields = Object.keys(expectedWeights[slug]).filter(field => field !== "hitting_power");
  const maxima = Object.fromEntries(fields.map(field => [field, Math.max(...players.map(p => p[field]))]));
  const changedPlayers = new Set();
  let ranks = 0;
  for (const player of players) {
    const rating = exactPlayerRating(player, slug, maxima) + "%";
    if (player[ratingKey] !== rating) {
      changedPlayers.add(player);
    }
    player[ratingKey] = rating;
  }
  // Full ties retain their order in the previous ranking for this category.
  players.sort((a, b) => parseInt(b[ratingKey]) - parseInt(a[ratingKey]) ||
    b.hitting_power - a.hitting_power || a[rankingKey] - b[rankingKey]);
  players.forEach((player, i) => {
    if (player[rankingKey] !== i + 1) ranks++;
    player[rankingKey] = i + 1;
  });
  return { ranks, changedPlayers };
}

function defensiveEdit(rosters, edited, attribute) {
  const players = rosters.flatMap(team => team.players);
  const group = players.filter(p => positions.dl.test(p.position));
  const changes = rateGroup(group, "dl", "rating", "ranking");
  assert(changes.ranks > 0);
  if (attribute === "maximum_speed") {
    assert(group.every(p => p === edited || p.maximum_speed < edited.maximum_speed));
    assert(rosters.filter(team => team.players.some(p => changes.changedPlayers.has(p))).length > 1);
  } else {
    assert.equal(changes.changedPlayers.size, 1);
  }
}

function rightTackleEdit(rosters) {
  const players = rosters.flatMap(team => team.players);
  const skill = players.filter(p => skillPositions.test(p.position));
  for (const team of rosters) {
    const kickSpeed = team.players.find(p => p.position === "RT").maximum_speed;
    for (const player of team.players.filter(p => skillPositions.test(p.position))) player.kick_return_maximum_speed = kickSpeed;
  }
  const returns = rateGroup(skill, "kick-returners", "kick_return_rating", "kick_return_ranking");
  assert(returns.changedPlayers.size > 0 && returns.ranks > 0);
  for (const player of skill) delete player.kick_return_maximum_speed;
  rateGroup(players.filter(p => positions.ol.test(p.position)), "ol", "rating", "ranking");
}

export const rosterEdits = [
  { team: "eagles", position: "LE", attribute: "hitting_power", value: 50, predict: defensiveEdit },
  { team: "eagles", position: "LE", attribute: "maximum_speed", value: 81, predict: defensiveEdit },
  { team: "eagles", position: "RT", attribute: "maximum_speed", value: 50, predict: rightTackleEdit },
];

export function predictRosterEdit(baseline, { team, position, attribute, value, predict }) {
  const expectedRosters = structuredClone(baseline);
  const roster = expectedRosters.get(team);
  const edited = roster.players.find(player => player.position === position);
  assert.notEqual(edited[attribute], value);
  edited[attribute] = value;

  // The real rebuild starts with the single raw edit and the original standings.
  const editedRoster = structuredClone(roster);
  predict([...expectedRosters.values()], edited, attribute);
  return { editedRoster, expectedRosters };
}
