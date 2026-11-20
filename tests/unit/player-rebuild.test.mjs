import { expect, it } from "vitest";
import { rebuildPlayerRatings } from "../../scripts/rebuild/player-ratings.mjs";
import { readTeamRosters } from "../../scripts/rebuild/roster-files.mts";

const skillAttributes = { running_speed: 50, maximum_speed: 50, hitting_power: 74, ball_control: 50, receptions: 50 };

function returnStarters(kickSpeed, puntSpeed) {
  return [
    { position: "RT", maximum_speed: kickSpeed },
    { position: "SS", maximum_speed: puntSpeed },
  ];
}

it("gives unlisted hitting power zero points and preserves each category's prior order on a full tie", () => {
  const back = { position: "RB1", ...skillAttributes, rushing_ranking: 2, receiving_ranking: 1 };
  const receiver = { position: "WR1", ...skillAttributes, rushing_ranking: 1, receiving_ranking: 2 };
  const defense = { position: "RE", rating: "17%", ranking: 28 };
  rebuildPlayerRatings([{ players: [back, receiver, defense, ...returnStarters(50, 50)] }], "offense");

  expect([back, receiver].map(p => [p.rushing_rating, p.rushing_ranking, p.receiving_rating, p.receiving_ranking]))
    .toEqual([["90%", 2, "95%", 1], ["90%", 1, "95%", 2]]);
  expect(defense).toEqual({ position: "RE", rating: "17%", ranking: 28 });
});

it("rates returns using each team's RT and SS speeds against the league maxima", () => {
  const first = { position: "RB1", ...skillAttributes };
  const second = { position: "RB1", ...skillAttributes };
  rebuildPlayerRatings([
    { players: [first, ...returnStarters(50, 100)] },
    { players: [second, ...returnStarters(100, 50)] },
  ], "offense");

  expect([first, second].map(p => [p.kick_return_rating, p.kick_return_ranking, p.punt_return_rating, p.punt_return_ranking]))
    .toEqual([["60%", 2, "90%", 1], ["90%", 1, "55%", 2]]);
});

it("uses the defensive scale and breaks equal displayed ratings by raw hitting power", () => {
  const attributes = { running_speed: 50, maximum_speed: 50, rushing_power: 50, pass_interceptions: 50 };
  const defenders = [
    { position: "RE", ...attributes, hitting_power: 19, ranking: 1 },
    { position: "LE", ...attributes, hitting_power: 22, ranking: 2 },
    { position: "NT", ...attributes, hitting_power: 69, ranking: 3 },
  ];
  const back = { position: "RB1", ...skillAttributes };
  rebuildPlayerRatings([{ players: [...defenders, back] }], "defense");

  expect(defenders.map(p => [p.rating, p.ranking])).toEqual([["60%", 3], ["60%", 2], ["91%", 1]]);
  expect(back).toEqual({ position: "RB1", ...skillAttributes });
});

it("keeps hand-maintained QB, kicker, and punter ratings and ranks through a full rebuild", () => {
  const published = ["QB1", "K", "P"].map(position => ({ position, rating: "44%", ranking: 8 }));
  const original = structuredClone(published);
  rebuildPlayerRatings([{ players: [...published, ...returnStarters(50, 50)] }], "all");
  expect(published).toEqual(original);
});

it("rebuilds the published rusher examples from their roster attributes", () => {
  const rosters = readTeamRosters();
  const examples = [
    ["49ers", "Jerry Rice", "81%"],
    ["raiders", "Bo Jackson", "82%"],
    ["giants", "Ottis Anderson", "68%"],
    ["bengals", "Ickey Woods", "43%"],
  ];
  const players = examples.map(([slug, name]) => {
    const player = rosters.get(slug).players.find(p => p.name === name);
    delete player.rushing_rating;
    return player;
  });

  rebuildPlayerRatings([...rosters.values()], "all");
  expect(players.map(p => p.rushing_rating)).toEqual(examples.map(([, , rating]) => rating));
});
