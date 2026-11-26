import { expect, it } from "vitest";
import { parseTeamRoster } from "../../scripts/rebuild/roster-files.mts";

it("scopes duplicate player identities to the team, position, and name", () => {
  const qb = { position: "QB1", name: "Smith", number: "12" };
  const roster = { full_name: "Test Team", players: [qb, { ...qb, position: "QB2" }] };
  for (const slug of ["bills", "jets"]) {
    expect(parseTeamRoster(slug, JSON.stringify(roster))).toEqual(roster);
  }
  const duplicate = { ...roster, players: [...roster.players, { ...qb, number: "15" }] };
  expect(() => parseTeamRoster("bills", JSON.stringify(duplicate)))
    .toThrow('Duplicate roster player: ["bills","QB1","Smith"]');
});
