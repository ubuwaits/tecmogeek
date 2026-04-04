import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { TeamData } from "@/lib/types";

import {
  buildTeamRatings,
  buildTeamRatingRecord,
  createOffensiveSkillLineups,
  createDefensiveGroups,
  createQuarterbackRoom,
  createReturnRoom,
  type TeamRatingRecord,
} from "../../scripts/rebuild-team-ratings";

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

  it("uses qb room and return room in the offensive formulas", () => {
    const teamData = readJson<TeamData>("eagles.json");
    const quarterbackRoom = createQuarterbackRoom(teamData.players);
    const returnRoom = createReturnRoom(teamData.players);
    const result = buildTeamRatingRecord("eagles", teamData);

    expect(result.components.qb_room).toBeCloseTo(quarterbackRoom.score, 3);
    expect(result.components.qb_rating).toBeCloseTo(Number.parseFloat(String(quarterbackRoom.bestQb.rating).replace("%", "")), 3);
    expect(result.components.return_room).toBeCloseTo(returnRoom.score, 3);
    expect(result.components.running_offense).toBeCloseTo(
      0.63 * result.components.running_skill +
      0.27 * result.components.ol_line +
      0.1 * result.components.return_room,
      2,
    );
    expect(result.components.passing_offense).toBeCloseTo(
      0.45 * result.components.qb_room +
      0.315 * result.components.passing_skill +
      0.135 * result.components.ol_line +
      0.1 * result.components.return_room,
      2,
    );
    expect(result.components.balanced_offense).toBeCloseTo(
      0.27 * result.components.qb_room +
      0.18 * result.components.ol_line +
      0.45 * result.components.balanced_skill +
      0.1 * result.components.return_room,
      2,
    );
  });

  it("keeps the generated team ratings file in sync with the source data", () => {
    const generated = readJson<TeamRatingRecord[]>("team-ratings.json");
    expect(generated).toEqual(buildTeamRatings());
  });

  it("keeps the generated team ratings sorted and representative of the expected team shapes", () => {
    const generated = readJson<TeamRatingRecord[]>("team-ratings.json");
    const teams = new Map(generated.map((record) => [record.team, record]));
    const fortyNiners = teams.get("49ers");
    const bears = teams.get("bears");
    const eagles = teams.get("eagles");

    expect(generated.map((record) => record.team)).toEqual([...generated.map((record) => record.team)].sort());
    expect(teams.get("steelers")?.selected_lineups.kr).toBe("Merril Hoge (RB1)");
    expect(teams.get("saints")?.selected_lineups.kr).toBe("Craig Heyward (RB1)");
    expect(teams.get("49ers")?.selected_lineups.pr).toBe("Tom Rathman (RB2)");
    expect(teams.get("bengals")?.selected_lineups.pr).toBe("Ickey Woods (RB2)");

    expect(Object.keys(fortyNiners?.selected_lineups.running_lineup ?? {})).toEqual(["RB1", "RB2", "WR1", "WR2", "TE1"]);
    expect(new Set(Object.values(fortyNiners?.selected_lineups.running_lineup ?? {})).size).toBe(5);
    expect(new Set(Object.values(fortyNiners?.selected_lineups.passing_lineup ?? {})).size).toBe(5);
    expect(new Set(Object.values(fortyNiners?.selected_lineups.balanced_lineup ?? {})).size).toBe(5);
    expect(fortyNiners?.selected_lineups.running_lineup.TE1).toBe("Tom Rathman (RB2)");
    expect(fortyNiners?.selected_lineups.balanced_lineup.WR1).toBe("Jerry Rice (WR2)");
    expect(fortyNiners?.selected_lineups.balanced_lineup.WR2).toBe("John Taylor (WR1)");
    expect(fortyNiners?.selected_lineups.balanced_lineup.TE1).toBe("Brent Jones (TE1)");
    expect(fortyNiners?.selected_lineups.passing_lineup.WR1).toBe("Jerry Rice (WR2)");
    expect(
      [
        fortyNiners?.selected_lineups.passing_lineup.WR2,
        fortyNiners?.selected_lineups.passing_lineup.TE1,
      ],
    ).toEqual(expect.arrayContaining(["John Taylor (WR1)", "Brent Jones (TE1)"]));
    expect(
      [
        fortyNiners?.selected_lineups.passing_lineup.RB1,
        fortyNiners?.selected_lineups.passing_lineup.RB2,
      ],
    ).not.toContain("Jerry Rice (WR2)");
    expect(fortyNiners?.components.return_room).toBeGreaterThan(0);
    expect(eagles?.components.qb_room).toBeLessThan(eagles?.components.qb_rating ?? Number.POSITIVE_INFINITY);
    expect(fortyNiners?.components.passing_offense).toBeGreaterThan(fortyNiners?.components.running_offense ?? 0);
    expect(bears?.defensive_rating).toBeGreaterThan(bears?.offensive_rating ?? 0);
    expect(eagles?.selected_lineups.best_qb).toBe("QB Eagles (QB1)");
  });
});
