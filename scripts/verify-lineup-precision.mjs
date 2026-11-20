import assert from "node:assert/strict";
import { init } from "z3-solver";
import { compareLineupScores, FLOAT_TOLERANCE, hasHighRunningPower, lineupScore } from "./rebuild-team-ratings.ts";

const { Context } = await init();
const { Real, Int, Sum, ToReal, Or, Solver } = new Context("lineup_precision");
const slots = ["RB1", "RB2", "WR1", "WR2", "TE1"];
const solver = new Solver();
const violations = [];
const scoreError = Real.val("1/100000000000"); // 1e-11
let operations = 0;

// For magnitudes below 256 binary64 rounds an operation with absolute error
// <= 2^-45. A decimal weight in [0,1] has conversion error <= 2^-53;
// multiplying that error by an operand below 256 adds at most 2^-45.
// 2^-42 conservatively covers both errors (including subnormal results).
function rounded(real) {
  violations.push(real.le(-255), real.ge(255));
  const error = Real.const("error_" + operations++);
  const bound = Real.val("1/4398046511104");
  solver.add(error.ge(bound.neg()), error.le(bound));
  return real.add(error);
}
const ops = {
  constant: value => Real.val(value),
  add: (a, b) => rounded(a.add(b)),
  multiply: (a, weight) => {
    assert(weight >= 0 && weight <= 1);
    violations.push(a.le(-256), a.ge(256));
    return rounded(a.mul(Real.val(String(weight))));
  },
};
function inputs(prefix) {
  return slots.map(slot => {
    const raw = Int.const(prefix + slot);
    solver.add(raw.ge(0), raw.le(100));
    return raw;
  });
}
async function prove(label, bad) {
  const result = await solver.check(Or(...bad));
  assert.equal(result, "unsat", result === "sat" ? label + ": " + solver.model() : label + ": " + result);
}

try {
  const rush = inputs("rush"), receive = inputs("receive");
  for (let hp = 0; hp <= 100; hp++) assert.equal(hasHighRunningPower(hp), hp >= 75);
  for (const high of [false, true]) {
    // Exact score numerators in units of 1/8000 for each HP branch.
    const support = high ? receive[4].add(1900) : receive[4].mul(20);
    const r = Sum(rush[0].mul(800), rush[1].mul(600), rush[2].mul(240), rush[3].mul(200), support.mul(8));
    const p = Sum(receive[0].mul(200), receive[1].mul(300), receive[2].mul(600), receive[3].mul(500), receive[4].mul(400));
    for (const [mode, units] of [["running", r.mul(4)], ["passing", p.mul(4)], ["balanced", r.add(p.mul(3))]]) {
      const floating = lineupScore(mode, slot => ToReal(rush[slots.indexOf(slot)]),
        slot => ToReal(receive[slots.indexOf(slot)]), high, ops);
      const difference = floating.sub(ToReal(units).div(8000));
      violations.push(units.lt(0), units.gt(800000), difference.lt(scoreError.neg()), difference.gt(scoreError));
    }
  }
  await prove("Intermediate range and score error", violations);
  violations.length = 0;

  // Compose two independently rounded scores. Allow rounding of the addition
  // and subtraction in chooseBestAssignment as well as literal conversion.
  const exact = inputsForComparison("candidate"), best = inputsForComparison("best");
  function inputsForComparison(name) {
    const units = Int.const(name + "_units");
    const fp = Real.const(name);
    solver.add(units.ge(0), units.le(800000));
    const error = fp.sub(ToReal(units).div(8000));
    solver.add(error.ge(scoreError.neg()), error.le(scoreError));
    return { units, fp };
  }
  const bytes = new DataView(new ArrayBuffer(8));
  bytes.setFloat64(0, FLOAT_TOLERANCE);
  const bits = bytes.getBigUint64(0);
  const significand = (1n << 52n) | (bits & ((1n << 52n) - 1n));
  const tolerance = Real.val(significand + "/" + (1n << (1075n - (bits >> 52n))));
  const threshold = rounded(best.fp.add(tolerance));
  const delta = rounded(exact.fp.sub(best.fp));
  const tied = delta.le(tolerance).and(delta.ge(tolerance.neg()));
  await prove("Score comparison", [
    ...violations,
    exact.fp.gt(threshold).neq(exact.units.gt(best.units)),
    tied.neq(exact.units.eq(best.units)),
  ]);
  // Exercise the production comparator at both extremes of every score's
  // error interval, against the same and adjacent grid points in both orders.
  for (let units = 0; units <= 800000; units++) {
    const score = units / 8000;
    const lo = score - 2e-11, hi = score + 2e-11;
    assert.equal(compareLineupScores(hi, lo), 0);
    assert.equal(compareLineupScores(lo, hi), 0);
    if (units < 800000) {
      const next = (units + 1) / 8000 - 2e-11;
      assert.equal(compareLineupScores(next, hi), 1);
      assert.equal(compareLineupScores(hi, next), -1);
    }
  }
  console.log("Proved binary64 score ordering and tolerance ties match exact 1/8000 scores in all three modes and both TE power tiers.");
} finally {
  solver.release();
}
