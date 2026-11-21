import type { TeamData } from "../../lib/types";
import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";

import faceHashes from "../fixtures/portraits/faces.json";

const players = readFileSync("tests/fixtures/portraits/players.tsv", "utf8")
  .trimEnd().split("\n").slice(1).map(line => {
    const [team, cell, position, name, face] = line.split("\t");
    return { team, cell: Number(cell), position, name, face };
  });

type Player = (typeof players)[number];
const sections: Record<string, RegExp> = {
  qb: /^QB[12]$/, skill: /^(?:RB|WR|TE)\d$/, ol: /^(?:C|LG|RG|LT|RT)$/,
  dl: /^(?:RE|NT|LE)$/, lb: /^(?:ROLB|RILB|LILB|LOLB)$/,
  secondary: /^(?:RCB|LCB|FS|SS)$/, k: /^K$/, p: /^P$/,
};

async function checkRows(rows: Locator, expected: Player[], teamSlug?: string) {
  const actual = await rows.evaluateAll((elements, teamSlug) => elements.map(row => {
    const sprite = row.querySelector<HTMLElement>('span[style*="/images/players/"]')!;
    const css = getComputedStyle(sprite);
    const team = teamSlug ?? row.querySelector<HTMLAnchorElement>('a[href^="/teams/"]')!.pathname.split("/")[2];
    return {
      team,
      name: row.querySelector("h3")!.textContent,
      position: row.querySelector("h4")!.textContent!.split(" ")[0],
      sheet: css.backgroundImage.match(/\/images\/players\/([^/"]+)\.png"\)$/)?.[1],
      x: parseFloat(css.backgroundPositionX),
      y: parseFloat(css.backgroundPositionY),
      width: css.width,
      height: css.height,
    };
  }), teamSlug);
  const byIdentity = new Map(expected.map(p => [p.team + "|" + p.name, p]));
  expect(actual).toHaveLength(expected.length);
  for (const row of actual) {
    const id = row.team + "|" + row.name;
    const player = byIdentity.get(id);
    expect(player, id).toBeDefined();
    expect(row, id).toMatchObject({ position: player!.position, sheet: player!.team,
      x: -32 * player!.cell || 0, y: 0, width: "32px", height: "32px" });
    byIdentity.delete(id);
  }
  expect(byIdentity.size).toBe(0);
}

const teams = new Set(players.map(player => player.team));

for (const team of teams) {
  test(`${team} roster sections and portrait pixels`, async ({ page }) => {
    expect(teams.size).toBe(28);
    const roster = players.filter(player => player.team === team);
    const source: TeamData = JSON.parse(readFileSync(`data/${team}.json`, "utf8"));
    expect(roster.map(p => p.cell)).toEqual(Array.from({ length: 30 }, (_, i) => i));
    await page.goto(`/teams/${team}/`);
    const hashes = await page.evaluate(async team => {
      const image = new Image();
      image.src = `/images/players/${team}.png`;
      await image.decode();
      if (image.width !== 960 || image.height !== 32) throw Error("Expected 30 horizontal 32px cells");
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 32;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      const hashes = [];
      for (let cell = 0; cell < 30; cell++) {
        ctx.clearRect(0, 0, 32, 32);
        ctx.drawImage(image, cell * 32, 0, 32, 32, 0, 0, 32, 32);
        const rgba = ctx.getImageData(0, 0, 32, 32).data;
        const rgb = new Uint8Array(32 * 32 * 3);
        for (let i = 0; i < 32 * 32; i++) {
          if (rgba[i * 4 + 3] !== 255) throw Error(`Unexpected transparency in cell ${cell}`);
          rgb.set(rgba.subarray(i * 4, i * 4 + 3), i * 3);
        }
        const hash = await crypto.subtle.digest("SHA-256", rgb);
        hashes.push(Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join(""));
      }
      return hashes;
    }, team);
    for (const player of roster) {
      expect(Object.values(sections).filter(pattern => pattern.test(player.position)), player.name).toHaveLength(1);
      expect(hashes[player.cell], `${player.name} cell ${player.cell}, face ${player.face}`)
        .toBe((faceHashes as Record<string, string>)[player.face]);
    }
    for (const [section, positions] of Object.entries(sections)) {
      const expected = roster.filter(p => positions.test(p.position));
      if (section === "skill") {
        for (const mode of ["rushing", "receiving", "kick-return", "punt-return"]) {
          await page.getByTestId("team-mode-" + mode).click();
          await expect(page.getByTestId("team-skill-section")).toHaveAttribute("data-mode", mode);
          await checkRows(page.getByTestId("team-skill-row"), expected, team);
        }
      } else {
        const rows = page.getByTestId("team-table-scroll-" + section).locator("ol > li:not(:first-child)");
        await expect(rows.locator("h3")).toHaveText(source.players.filter(player => positions.test(player.position)).map(player => player.name));
        await checkRows(rows, expected, team);
      }
    }
  });
}

const { secondary, skill, ...singlePositionTables } = sections;
const leaderboards = { ...singlePositionTables, "cb-s": secondary, rushers: skill,
  receivers: skill, "kick-returners": skill, "punt-returners": skill };
for (const [slug, positions] of Object.entries(leaderboards)) {
  test(`${slug} leaderboard portraits`, async ({ page }) => {
    await page.goto(`/players/${slug}/`);
    await checkRows(page.getByTestId("leaderboard-row"), players.filter(p => positions.test(p.position)));
  });
}
