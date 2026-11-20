export async function rejectCounterexample(Solver, violation, description) {
  const solver = new Solver();
  try {
    solver.add(violation);
    const result = await solver.check();
    if (result === "sat") throw new Error(`${description}: ${solver.model()}`);
    if (result !== "unsat") throw new Error(`${description}: ${solver.reasonUnknown()}`);
  } finally {
    solver.release();
  }
}
