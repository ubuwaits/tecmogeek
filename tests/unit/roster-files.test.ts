import { expect, it } from "vitest";
import { parseTeamRoster } from "../../lib/teams/parse-roster.mts";

const qb = {
  position: "QB1", name: "Smith", number: "12",
  maximum_speed: 0, passing_speed: 50, pass_control: 100, avoid_pass_block: 50,
};

it("scopes duplicate player identities to the team, position, and name", () => {
  const roster = { full_name: "Test Team", players: [qb, { ...qb, position: "QB2" }] };
  for (const slug of ["bills", "jets"]) {
    expect(parseTeamRoster(slug, JSON.stringify(roster))).toEqual(roster);
  }
  const duplicate = { ...roster, players: [...roster.players, { ...qb, number: "15" }] };
  expect(() => parseTeamRoster("bills", JSON.stringify(duplicate)))
    .toThrow('Duplicate roster player: ["bills","QB1","Smith"]');
});

it.each([undefined, null, "50", 0.5, -1, 101])("reports an invalid stored passing skill (%s)", value => {
  const roster = { full_name: "Test Team", players: [{ ...qb, pass_control: value }] };
  expect(() => parseTeamRoster("bills", JSON.stringify(roster)))
    .toThrow(`data/bills.json: QB1 Smith: pass_control must be an integer from 0 to 100, received ${JSON.stringify(value)}`);
});

it("identifies the file containing malformed JSON", () => {
  expect(() => parseTeamRoster("bills", "{")).toThrow("data/bills.json: invalid JSON");
});
