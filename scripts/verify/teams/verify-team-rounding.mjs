import assert from "node:assert/strict";
import { buildTeamRatingRecord } from "../../../lib/teams/calculate-ratings.mts";

// Common denominator for the 1/8000 skill scores, offense blends and 11 starters.
// All intermediate integer products stay below Number.MAX_SAFE_INTEGER.
const scale = 2_112_000_000;
function divide(n, d) {
  assert(Number.isSafeInteger(n) && n % d === 0, `Inexact division: ${n}/${d}`);
  return n / d;
}

function exactTeamScores(players, selected) {
  const scores = {};
  const value = (player, field) => {
    assert(/^\d+%?$/.test(String(player[field])), `Invalid ${field} on ${player.name}`);
    return Number.parseInt(player[field]) * scale;
  };
  const group = pattern => players.filter(p => pattern.test(p.position));
  const mean = pattern => {
    const unit = group(pattern);
    return divide(unit.reduce((sum, p) => sum + value(p, "rating"), 0), unit.length);
  };
  const topPair = (pool, field, first, second) => {
    const [a, b] = pool.map(p => value(p, field)).sort((a, b) => b - a);
    return divide(first * a + second * b, first + second);
  };
  const skill = group(/^(RB|WR|TE)\d+$/);
  const qb = group(/^QB\d+$/);
  scores.qb_room = topPair(qb, "rating", 4, 1);
  scores.qb_rating = Math.max(...qb.map(p => value(p, "rating")));
  scores.return_room = divide(55 * topPair(skill, "kick_return_rating", 3, 1) +
    45 * topPair(skill, "punt_return_rating", 3, 1), 100);
  scores.ol_line = mean(/^(C|LG|RG|LT|RT)$/);
  scores.dl_group = mean(/^(RE|NT|LE)$/);
  scores.lb_group = mean(/^(ROLB|RILB|LILB|LOLB)$/);
  scores.secondary_group = mean(/^(RCB|LCB|FS|SS)$/);
  scores.defensive_rating = divide(3 * scores.dl_group + 4 * scores.lb_group + 4 * scores.secondary_group, 11);
  for (const mode of ["running", "passing", "balanced"]) {
    let run = 0;
    let pass = 0;
    for (const [i, slot] of ["RB1", "RB2", "WR1", "WR2", "TE1"].entries()) {
      const p = skill.find(p => p.name + " (" + p.position + ")" === selected[mode + "_lineup"][slot]);
      const receiving = value(p, "receiving_rating");
      const support = p.hitting_power >= 75 ? 95 * scale + divide(receiving, 20) : receiving;
      run += [40, 30, 12, 10, 8][i] * (slot === "TE1" ? support : value(p, "rushing_rating"));
      pass += [10, 15, 30, 25, 20][i] * receiving;
    }
    scores[mode + "_skill"] = mode === "balanced" ? divide(run + 3 * pass, 400)
      : divide(mode === "running" ? run : pass, 100);
  }
  const s = scores;
  s.running_offense = divide(63 * s.running_skill + 27 * s.ol_line + 10 * s.return_room, 100);
  s.passing_offense = divide(450 * s.qb_room + 315 * s.passing_skill + 135 * s.ol_line + 100 * s.return_room, 1000);
  s.balanced_offense = divide(27 * s.qb_room + 18 * s.ol_line + 45 * s.balanced_skill + 10 * s.return_room, 100);
  s.offensive_rating = divide(s.running_offense + s.passing_offense + 2 * s.balanced_offense, 4);
  s.overall_rating = divide(s.offensive_rating + s.defensive_rating, 2);
  return scores;
}

// Decode the actual pre-storage double to a fraction. Positive ties round up in
// toFixed, including when the binary value itself is exactly on the midpoint.
function roundBinary64(value) {
  if (value === 0) return 0;
  assert(value > 0 && Number.isFinite(value));
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  const bits = view.getBigUint64(0);
  const exponent = Number(bits >> 52n);
  const fraction = bits & ((1n << 52n) - 1n);
  const mantissa = exponent ? (1n << 52n) + fraction : fraction;
  const divisor = 1n << BigInt(1075 - Math.max(1, exponent));
  return Number((2000n * mantissa + divisor) / (2n * divisor)) / 1000;
}

export function verifyTeamRounding(slug, roster, record = buildTeamRatingRecord(slug, roster)) {
  const ties = [];
  assert.equal(record.team, slug);
  const unrounded = buildTeamRatingRecord(record.team, roster, value => value);
  const scores = exactTeamScores(roster.players, record.selected_lineups);
  assert.deepEqual(Object.keys(scores).sort(),
    ["overall_rating", "offensive_rating", "defensive_rating", ...Object.keys(record.components)].sort());
  for (const [field, units] of Object.entries(scores)) {
    const step = scale / 1000;
    const expected = Math.floor((units + step / 2) / step) / 1000;
    const stored = record[field] ?? record.components[field];
    if (units % step === step / 2) {
      const binary = unrounded[field] ?? unrounded.components[field];
      assert(Math.abs(binary - units / scale) < 1e-10);
      assert.equal(stored, roundBinary64(binary), record.team + "." + field);
      ties.push({ team: record.team, field, stored, halfUp: expected });
    }
    else assert.equal(stored, expected, record.team + "." + field);
  }
  return { count: Object.keys(scores).length, ties };
}
