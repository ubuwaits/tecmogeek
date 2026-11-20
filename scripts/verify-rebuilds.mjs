import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { verifyRosterEdits } from "./rebuild-edit-checks.mjs";

const root = path.resolve(import.meta.dirname, "..");
const revision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const commands = ["rebuild:offense", "rebuild:defense", "rebuild:team-ratings"];

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

  function runRebuilds() {
    for (const command of commands) execFileSync("pnpm", ["run", command], { cwd: checkout, stdio: "inherit" });
  }

  function checkBaseline(pass) {
    runRebuilds();
    const files = new Set(dataFiles(directory));
    const differences = [];
    for (const [file, bytes] of baseline) {
      if (!files.delete(file)) differences.push(`missing data/${file}`);
      else if (!readFileSync(path.join(directory, file)).equals(bytes)) differences.push(`changed data/${file}`);
    }
    for (const file of files) differences.push(`unexpected data/${file}`);
    if (differences.length) throw new Error(`Pass ${pass} differs from ${revision}:\n${differences.join("\n")}`);
    console.log(`Pass ${pass}: all ${baseline.size} data files match ${revision.slice(0, 7)} byte-for-byte.`);
  }

  if (process.argv.includes("--edit")) {
    verifyRosterEdits(checkout, baseline, runRebuilds, dataFiles);
  } else {
    for (const pass of [1, 2]) checkBaseline(pass);
  }
} finally {
  rmSync(checkout, { recursive: true, force: true });
}
