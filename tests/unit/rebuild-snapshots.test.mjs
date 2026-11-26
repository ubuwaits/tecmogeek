import { it, expect } from "vitest";
import { snapshotDifferences } from "../../scripts/verify/rebuilds/compare-snapshots.mjs";

it("compares snapshot bytes and reports every missing, changed, and unexpected file", () => {
  const baseline = new Map([
    ["missing", Buffer.alloc(0)], ["changed", Buffer.from([0x80])], ["same", Buffer.from([0xff])],
  ]);
  const rebuilt = new Map([
    ["same", Buffer.from([0xff])], ["unexpected", Buffer.alloc(0)], ["changed", Buffer.from([0x81])],
  ]);
  expect(snapshotDifferences(baseline, rebuilt)).toEqual(["missing data/missing", "changed data/changed", "unexpected data/unexpected"]);
  expect(snapshotDifferences(baseline, new Map([...baseline].reverse()))).toEqual([]);
});
