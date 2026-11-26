import { expect, it } from "vitest";
import { comparePlayerRanks } from "../../scripts/rebuild/compare-player-ranks.mjs";
import { rebuildPlayerRatings } from "../../scripts/rebuild/player-ratings.mjs";
import { readTeamRosters } from "../../scripts/rebuild/roster-files.mts";

const skillAttributes = { running_speed: 50, maximum_speed: 50, hitting_power: 74, ball_control: 50, receptions: 50 };

function returnStarters(kickSpeed, puntSpeed) {
  return [
    { position: "RT", maximum_speed: kickSpeed },
    { position: "SS", maximum_speed: puntSpeed },
  ];
}

// For each rating and hitting-power difference, list the expected comparator
// signs when the left player's previous rank is lower, equal, or higher.
const comparatorCases = [
  [-1, -1, [1, 1, 1]],
  [-1,  0, [1, 1, 1]],
  [-1,  1, [1, 1, 1]],
  [ 0, -1, [1, 1, 1]],
  [ 0,  0, [-1, 0, 1]],
  [ 0,  1, [-1, -1, -1]],
  [ 1, -1, [-1, -1, -1]],
  [ 1,  0, [-1, -1, -1]],
  [ 1,  1, [-1, -1, -1]],
].flatMap(([rating, hittingPower, signs]) =>
  [-1, 0, 1].map((previousRank, i) => ({ rating, hittingPower, previousRank, expected: signs[i] })));

it.each(comparatorCases)("compares rank differences of $rating rating, $hittingPower HP, and $previousRank prior rank",
  ({ rating, hittingPower, previousRank, expected }) => {
    const left = { rating, hittingPower, previousRank };
    const right = { rating: 0, hittingPower: 0, previousRank: 0 };
    expect(Math.sign(comparePlayerRanks(left, right))).toBe(expected);
  });

it("gives unlisted hitting power zero points and preserves each category's prior order on a full tie", () => {
  const back = { position: "RB1", ...skillAttributes, rushing_ranking: 2, receiving_ranking: 1 };
  const receiver = { position: "WR1", ...skillAttributes, rushing_ranking: 1, receiving_ranking: 2 };
  const defense = { position: "RE", rating: "17%", ranking: 28 };
  const teams = new Map([["jets", { players: [back, receiver, defense, ...returnStarters(50, 50)] }]]);
  const original = structuredClone(teams);
  const rebuilt = rebuildPlayerRatings(teams, "offense").get("jets");

  expect(teams).toEqual(original);
  expect(rebuilt.players.slice(0, 2).map(p => [p.rushing_rating, p.rushing_ranking, p.receiving_rating, p.receiving_ranking]))
    .toEqual([["90%", 2, "95%", 1], ["90%", 1, "95%", 2]]);
  expect(rebuilt.players[2]).toEqual({ position: "RE", rating: "17%", ranking: 28 });
});

it("rates returns using each team's RT and SS speeds against the league maxima", () => {
  const first = { position: "RB1", ...skillAttributes };
  const second = { position: "RB1", ...skillAttributes };
  const rosters = new Map([
    ["jets", { players: [first, ...returnStarters(50, 100)] }],
    ["bills", { players: [second, ...returnStarters(100, 50)] }],
  ]);
  const rebuilt = rebuildPlayerRatings(rosters, "offense");
  expect(rebuilt.get("jets").players[0]).toMatchObject({
    kick_return_rating: "60%", kick_return_ranking: 2, punt_return_rating: "90%", punt_return_ranking: 1,
  });
  expect(rebuilt.get("bills").players[0]).toMatchObject({
    kick_return_rating: "90%", kick_return_ranking: 1, punt_return_rating: "55%", punt_return_ranking: 2,
  });
});

it("uses the defensive scale and breaks equal displayed ratings by raw hitting power", () => {
  const attributes = { running_speed: 50, maximum_speed: 50, rushing_power: 50, pass_interceptions: 50 };
  const defenders = [
    { position: "RE", ...attributes, hitting_power: 19, ranking: 1 },
    { position: "LE", ...attributes, hitting_power: 22, ranking: 2 },
    { position: "NT", ...attributes, hitting_power: 69, ranking: 3 },
  ];
  const back = { position: "RB1", ...skillAttributes };
  const original = structuredClone(defenders);
  const rosters = new Map([["jets", { players: [...defenders, back] }]]);
  const rebuilt = rebuildPlayerRatings(rosters, "defense").get("jets");

  expect(defenders).toEqual(original);
  expect(rebuilt.players.slice(0, 3).map(p => [p.rating, p.ranking])).toEqual([["60%", 3], ["60%", 2], ["91%", 1]]);
  expect(rebuilt.players[3]).toEqual({ position: "RB1", ...skillAttributes });
});

it("keeps hand-maintained QB, kicker, and punter ratings and ranks through a full rebuild", () => {
  const published = ["QB1", "K", "P"].map(position => ({ position, rating: "44%", ranking: 8 }));
  const original = structuredClone(published);
  const rosters = new Map([["jets", { players: [...published, ...returnStarters(50, 50)] }]]);
  const rebuilt = rebuildPlayerRatings(rosters, "all").get("jets");
  expect(rebuilt.players.slice(0, 3)).toEqual(original);
});

it("rebuilds the published rusher examples from their roster attributes", () => {
  const rosters = readTeamRosters();
  const examples = [
    ["49ers", "Jerry Rice", "81%"],
    ["raiders", "Bo Jackson", "82%"],
    ["giants", "Ottis Anderson", "68%"],
    ["bengals", "Ickey Woods", "43%"],
  ];
  for (const [slug, name] of examples) {
    const player = rosters.get(slug).players.find(p => p.name === name);
    delete player.rushing_rating;
  }

  const rebuilt = rebuildPlayerRatings(rosters, "all");
  for (const [slug, name, rating] of examples) {
    expect(rebuilt.get(slug).players.find(p => p.name === name)?.rushing_rating).toBe(rating);
    expect(rosters.get(slug).players.find(p => p.name === name)).not.toHaveProperty("rushing_rating");
  }
});
