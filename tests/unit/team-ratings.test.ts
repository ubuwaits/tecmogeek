import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { TeamData, TeamSlug } from "@/lib/types";

import {
  buildTeamRatingRecord,
  createOffensiveSkillLineups,
  createDefensiveGroups,
  createQuarterbackRoom,
  createReturnRoom,
} from "../../lib/teams/calculate-ratings.mts";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(fileName: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8")) as T;
}

describe("team ratings generator", () => {
  it("prefers the stronger quarterback even when he is listed as QB2", () => {
    const result = createQuarterbackRoom([
      { team: "Test", position: "QB1", name: "Starter", number: "#1", rating: "40%" },
      { team: "Test", position: "QB2", name: "Backup", number: "#2", rating: "80%" },
    ]);

    expect(result.bestQb.name).toBe("Backup");
    expect(result.backupQb.name).toBe("Starter");
    expect(result.score).toBe(72);
  });

  it("allows bench skill players to become the primary kick and punt returners", () => {
    const result = createReturnRoom([
      { team: "Test", position: "RB1", name: "Starter RB", number: "#1", kick_return_rating: "40%", punt_return_rating: "40%" },
      { team: "Test", position: "WR1", name: "Starter WR", number: "#2", kick_return_rating: "45%", punt_return_rating: "45%" },
      { team: "Test", position: "WR4", name: "Bench Burner", number: "#3", kick_return_rating: "90%", punt_return_rating: "50%" },
      { team: "Test", position: "TE2", name: "Bench Shifter", number: "#4", kick_return_rating: "50%", punt_return_rating: "88%" },
    ]);

    expect(result.kickReturner.name).toBe("Bench Burner");
    expect(result.puntReturner.name).toBe("Bench Shifter");
    expect(result.kickReturnScore).toBe(80);
    expect(result.puntReturnScore).toBeCloseTo(78.5);
  });

  it("builds fixed-slot running, passing, and balanced lineups", () => {
    const result = createOffensiveSkillLineups([
      { team: "Test", position: "RB1", name: "Power Back", number: "#1", rushing_rating: "80%", receiving_rating: "30%", hitting_power: 25 },
      { team: "Test", position: "RB2", name: "Support Back", number: "#2", rushing_rating: "72%", receiving_rating: "45%", hitting_power: 56 },
      { team: "Test", position: "RB3", name: "Hybrid Star", number: "#3", rushing_rating: "88%", receiving_rating: "88%", hitting_power: 56 },
      { team: "Test", position: "RB4", name: "Reserve Back", number: "#4", rushing_rating: "40%", receiving_rating: "30%", hitting_power: 25 },
      { team: "Test", position: "WR1", name: "Alpha WR", number: "#5", rushing_rating: "45%", receiving_rating: "95%", hitting_power: 13 },
      { team: "Test", position: "WR2", name: "Beta WR", number: "#6", rushing_rating: "38%", receiving_rating: "85%", hitting_power: 13 },
      { team: "Test", position: "WR3", name: "Depth WR", number: "#7", rushing_rating: "35%", receiving_rating: "55%", hitting_power: 13 },
      { team: "Test", position: "WR4", name: "Reserve WR", number: "#8", rushing_rating: "33%", receiving_rating: "50%", hitting_power: 13 },
      { team: "Test", position: "TE1", name: "Safety TE", number: "#9", rushing_rating: "25%", receiving_rating: "70%", hitting_power: 81 },
      { team: "Test", position: "TE2", name: "Block TE", number: "#10", rushing_rating: "20%", receiving_rating: "35%", hitting_power: 94 },
    ]);

    expect([result.runningAssignment.RB1.name, result.runningAssignment.RB2.name]).toEqual(
      expect.arrayContaining(["Hybrid Star", "Power Back"]),
    );
    expect(result.runningAssignment.TE1.name).toBe("Safety TE");
    expect([result.passingAssignment.RB1.name, result.passingAssignment.RB2.name]).not.toContain("Hybrid Star");
    expect([result.passingAssignment.WR1.name, result.passingAssignment.WR2.name, result.passingAssignment.TE1.name]).toEqual(
      expect.arrayContaining(["Alpha WR", "Beta WR", "Hybrid Star"]),
    );
    expect([result.balancedAssignment.RB1.name, result.balancedAssignment.RB2.name]).toEqual(
      expect.arrayContaining(["Power Back", "Support Back"]),
    );
    expect([result.balancedAssignment.WR1.name, result.balancedAssignment.WR2.name, result.balancedAssignment.TE1.name]).toEqual(
      expect.arrayContaining(["Alpha WR", "Beta WR", "Hybrid Star"]),
    );
    expect(new Set(Object.values(result.balancedAssignment).map((player) => player.name)).size).toBe(5);
  });

  it("weights defensive units by fixed starter counts", () => {
    const result = createDefensiveGroups([
      { team: "Test", position: "RE", name: "RE", number: "#1", rating: "10%" },
      { team: "Test", position: "NT", name: "NT", number: "#2", rating: "10%" },
      { team: "Test", position: "LE", name: "LE", number: "#3", rating: "10%" },
      { team: "Test", position: "ROLB", name: "ROLB", number: "#4", rating: "20%" },
      { team: "Test", position: "RILB", name: "RILB", number: "#5", rating: "20%" },
      { team: "Test", position: "LILB", name: "LILB", number: "#6", rating: "20%" },
      { team: "Test", position: "LOLB", name: "LOLB", number: "#7", rating: "20%" },
      { team: "Test", position: "RCB", name: "RCB", number: "#8", rating: "30%" },
      { team: "Test", position: "LCB", name: "LCB", number: "#9", rating: "30%" },
      { team: "Test", position: "FS", name: "FS", number: "#10", rating: "30%" },
      { team: "Test", position: "SS", name: "SS", number: "#11", rating: "30%" },
    ]);

    expect(result.dlGroup).toBe(10);
    expect(result.lbGroup).toBe(20);
    expect(result.secondaryGroup).toBe(30);
    expect(result.score).toBeCloseTo((3 * 10 + 4 * 20 + 4 * 30) / 11);
  });

  it.each([
    ["NT", "RE", "defensive line"],
    ["RILB", "ROLB", "linebackers"],
    ["FS", "RCB", "secondary"],
    ["LG", "C", "offensive line"],
  ])("rejects replacing %s with a duplicate %s in the %s", (missing, duplicate, group) => {
    const team = readJson<TeamData>("eagles.json");
    const players = team.players.map(player => player.position === missing ? { ...player, position: duplicate } : player);
    expect(() => buildTeamRatingRecord("eagles", { ...team, players }))
      .toThrow(`Expected exactly one ${duplicate} in ${group}, received 2.`);
  });

  it("identifies a missing starter", () => {
    const team = readJson<TeamData>("eagles.json");
    expect(() => createDefensiveGroups(team.players.filter(player => player.position !== "SS")))
      .toThrow("Expected exactly one SS in secondary, received 0.");
  });

  it("selects the published quarterbacks, returners, and 49ers skill lineups", () => {
    const selected = (slug: TeamSlug) => buildTeamRatingRecord(slug, readJson<TeamData>(slug + ".json")).selected_lineups;
    const fortyNiners = selected("49ers");

    expect(selected("eagles").best_qb).toBe("QB Eagles (QB1)");
    expect(selected("steelers").kr).toBe("Merril Hoge (RB1)");
    expect(selected("saints").kr).toBe("Craig Heyward (RB1)");
    expect(fortyNiners.pr).toBe("Tom Rathman (RB2)");
    expect(selected("bengals").pr).toBe("Ickey Woods (RB2)");

    expect(Object.keys(fortyNiners.running_lineup)).toEqual(["RB1", "RB2", "WR1", "WR2", "TE1"]);
    expect(new Set(Object.values(fortyNiners.running_lineup)).size).toBe(5);
    expect(new Set(Object.values(fortyNiners.passing_lineup)).size).toBe(5);
    expect(new Set(Object.values(fortyNiners.balanced_lineup)).size).toBe(5);
    expect(fortyNiners.running_lineup.TE1).toBe("Tom Rathman (RB2)");
    expect(fortyNiners.balanced_lineup.WR1).toBe("Jerry Rice (WR2)");
    expect(fortyNiners.balanced_lineup.WR2).toBe("John Taylor (WR1)");
    expect(fortyNiners.balanced_lineup.TE1).toBe("Brent Jones (TE1)");
    expect(fortyNiners.passing_lineup.WR1).toBe("Jerry Rice (WR2)");
    expect(
      [
        fortyNiners.passing_lineup.WR2,
        fortyNiners.passing_lineup.TE1,
      ],
    ).toEqual(expect.arrayContaining(["John Taylor (WR1)", "Brent Jones (TE1)"]));
    expect(
      [
        fortyNiners.passing_lineup.RB1,
        fortyNiners.passing_lineup.RB2,
      ],
    ).not.toContain("Jerry Rice (WR2)");
  });
});
