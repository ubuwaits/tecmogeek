import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { snapshotDifferences } from "./compare-snapshots.mjs";
import { verifyRosterEdits } from "./edit-checks.mjs";

const root = path.resolve(import.meta.dirname, "../../..");
const revision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const commands = ["rebuild:offense", "rebuild:defense"];

function dataFiles(directory) {
  return readdirSync(directory, { withFileTypes: true, recursive: true }).filter(entry => !entry.isDirectory())
    .map(entry => {
      if (!entry.isFile()) throw new Error(`Unexpected non-file in data: ${entry.name}`);
      return path.relative(directory, path.join(entry.parentPath, entry.name));
    });
}

const checkout = mkdtempSync(path.join(tmpdir(), "tecmogeek-rebuild-"));
try {
  execFileSync("git", ["clone", "--quiet", "--local", "--shared", "--no-checkout", root, checkout]);
  execFileSync("git", ["checkout", "--quiet", "--detach", revision], { cwd: checkout });
  const directory = path.join(checkout, "data");
  const tracked = execFileSync("git", ["ls-tree", "-rz", "--name-only", revision, "--", "data"], { cwd: checkout, encoding: "utf8" });
  const baseline = new Map(tracked.split("\0").filter(Boolean).map(file => [
    path.relative("data", file), execFileSync("git", ["cat-file", "blob", revision + ":" + file], { cwd: checkout }),
  ]));
  if (!baseline.size) throw new Error("The commit has no tracked data files.");

  // Exercise pending rebuild code and package commands with pristine, committed input.
  cpSync(path.join(root, "package.json"), path.join(checkout, "package.json"));
  rmSync(path.join(checkout, "scripts"), { recursive: true });
  cpSync(path.join(root, "scripts"), path.join(checkout, "scripts"), { recursive: true });

  cpSync(path.join(root, "lib"), path.join(checkout, "lib"), { recursive: true });

  function run(commandsToRun) {
    for (const command of commandsToRun) execFileSync("pnpm", ["run", command], { cwd: checkout, stdio: "inherit" });
  }

  function snapshot() {
    return new Map(dataFiles(directory).map(name => [name, readFileSync(path.join(directory, name))]));
  }

  function checkFiles(expected, actual, description) {
    const differences = snapshotDifferences(expected, actual);
    if (differences.length) throw new Error(`${description}:\n${differences.join("\n")}`);
  }

  const combined = ["rebuild:all"];
  if (process.argv.includes("--edit")) {
    const bills = JSON.parse(baseline.get("bills.json"));
    const back = bills.players.find(player => player.position === "RB1");
    back.maximum_speed = "typo";
    writeFileSync(path.join(directory, "bills.json"), JSON.stringify(bills));
    // Make a premature rewrite of an earlier, valid team observable in the snapshot.
    writeFileSync(path.join(directory, "49ers.json"), Buffer.concat([baseline.get("49ers.json"), Buffer.from("\n")]));
    const invalid = snapshot();
    const result = spawnSync("pnpm", ["run", "rebuild:all"], { cwd: checkout, encoding: "utf8" });
    if (result.error) throw result.error;
    assert(result.status > 0, "Expected the invalid Buffalo roster to fail the rebuild");
    assert(result.stderr.includes(`bills.json: RB1 ${back.name}: maximum_speed`), result.stderr);
    assert(result.stderr.includes('"typo"'), result.stderr);
    checkFiles(invalid, snapshot(), "Failed rebuild changed the data directory");
    console.log("Verified an invalid Buffalo speed fails the rebuild and preserves every data file.");

    verifyRosterEdits(checkout, baseline, () => {
      const edited = snapshot();
      run(commands);
      const standalone = snapshot();
      for (const [name, bytes] of edited) writeFileSync(path.join(directory, name), bytes);
      run(combined);
      const rebuilt = snapshot();
      checkFiles(standalone, rebuilt, "Combined rebuild differs from standalone rebuilds after edit");
      return rebuilt;
    });
  } else {
    for (const sequence of [commands, combined]) {
      for (const pass of [1, 2]) {
        run(sequence);
        checkFiles(baseline, snapshot(), `Pass ${pass} of ${sequence.join(", ")} differs from ${revision}`);
        console.log(`Pass ${pass} of ${sequence.join(", ")}: all ${baseline.size} data files match ${revision.slice(0, 7)} byte-for-byte.`);
      }
    }
  }
} finally {
  rmSync(checkout, { recursive: true, force: true });
}
