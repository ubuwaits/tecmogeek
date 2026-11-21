import { expectedWeights, skillHP, lineHP, defenseHP } from "../../scripts/verify/players/rating-spec.mjs";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { POSITION_PAGES } = require("../../lib/players/config.ts");
const { RECEIVING_COLUMNS } = require("../../lib/players/metrics.ts");
const { TEAM_SLUGS } = require("../../lib/types.ts");

const weightHeadings = {
  qb: "QB", rushers: "Rushers", receivers: "Receivers", "kick-returners": "Kick Returners",
  "punt-returners": "Punt Returners", ol: "OL", dl: "DL", lb: "LB", "cb-s": "CB/S", k: "K", p: "P",
};

async function expectTable(table, rows, description) {
  await expect(table, description).toBeVisible();
  const actual = await table.getByRole("row").evaluateAll(elements =>
    elements.map(row => Array.from(row.cells, cell => cell.innerText.trim())));
  expect(actual, description).toEqual(rows);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/about/ratings/");
});

test("published weights and hitting-power lookups match the player formulas", async ({ page }) => {
  const content = page.getByTestId("ratings-content-player");
  const tables = content.getByRole("table");
  const weights = tables.filter({ has: page.getByRole("columnheader", { name: "Weight", exact: true }) });
  await expect(weights).toHaveCount(POSITION_PAGES.length);
  for (const { slug, columns } of POSITION_PAGES) {
    const heading = weightHeadings[slug];
    const title = content.getByRole("heading", { name: new RegExp(`^${heading}(?:$| )`) }).last();
    const table = title.locator("xpath=following-sibling::*[1]").and(weights);
    const rows = Object.entries(expectedWeights[slug]).map(([key, weight]) =>
      [columns.find(column => column.key === key).tooltip, weight + "%"]);
    await expectTable(table, [["Attribute", "Weight"], ...rows], slug);
  }

  const ladders = [
    ["Hitting Power uses these score bands for rusher", skillHP, true],
    ["OL Hitting Power uses these score bands", lineHP, false],
    ["Defensive Hitting Power uses these score bands", defenseHP, false],
  ];
  await expect(tables.filter({ has: page.getByRole("columnheader", { name: "Hitting Power" }) })).toHaveCount(ladders.length);
  for (const [intro, ladder, hasLowerBand] of ladders) {
    const rows = Object.entries(ladder).map(([value, score]) => [value, score + "%"]);
    if (hasLowerBand) rows.unshift(["Below " + Math.min(...Object.keys(ladder).map(Number)), "0%"]);
    const table = content.getByText(intro, { exact: false }).locator("xpath=following-sibling::*[1]");
    await expectTable(table, [["Hitting Power", "Score"], ...rows], intro);
  }
});

// Positive fractions rounded half-up. Keep the sum exact until its final display rounding.
function rounded(numerator, denominator, scale) {
  return Number((2n * numerator * BigInt(scale) + denominator) / (2n * denominator));
}

test("Rice and Jackson examples agree with raw rosters at each displayed precision", async ({ page }) => {
  const content = page.getByTestId("ratings-content-player");
  const pool = TEAM_SLUGS.flatMap(team => JSON.parse(readFileSync(`data/${team}.json`, "utf8")).players)
    .filter(player => /^(RB|WR|TE)\d+$/.test(player.position));
  expect(pool).toHaveLength(280);
  const roles = [
    { weights: expectedWeights.receivers, intro: "Here are the ratings for each player as a receiver:", ratingKey: "receiving_rating" },
    { weights: expectedWeights.rushers, intro: "Now here are their rusher ratings:", ratingKey: "rushing_rating" },
  ];
  for (const [index, name] of ["Jerry Rice", "Bo Jackson"].entries()) {
    const matches = pool.filter(player => player.name === name);
    expect(matches, name).toHaveLength(1);
    const [player] = matches;
    const surname = name.split(" ")[1];
    const scores = new Map();
    const rows = [["Attribute", "Value", "Score"]];
    for (const { key, tooltip } of RECEIVING_COLUMNS) {
      const raw = player[key];
      const hp = key === "hitting_power";
      const numerator = BigInt(hp ? skillHP[raw] ?? 0 : raw);
      const denominator = BigInt(hp ? 100 : Math.max(...pool.map(p => p[key])));
      const basisPoints = rounded(numerator, denominator, 10000);
      scores.set(key, { numerator, denominator, basisPoints });
      rows.push([tooltip, String(raw), (basisPoints / 100).toFixed(hp ? 0 : 2) + "%"]);
    }
    const heading = content.getByRole("heading", { name: surname, exact: true });
    await expectTable(heading.locator("xpath=following-sibling::*[1]"), rows, name);

    for (const { weights, intro, ratingKey } of roles) {
      const terms = [];
      let total = 0n;
      let divisor = 1n;
      for (const [key, weight] of Object.entries(weights)) {
        const { numerator, denominator, basisPoints } = scores.get(key);
        total = total * denominator + BigInt(weight) * numerator * divisor;
        divisor *= denominator;
        terms.push(`${weight} × ${basisPoints / 10000}`);
      }
      const rating = (rounded(total, divisor, 100) / 100).toFixed(2) + "%";
      expect(player[ratingKey]).toBe(rounded(total, divisor, 1) + "%");
      const example = content.getByText(intro, { exact: true }).locator(`xpath=following-sibling::*[${index + 1}]`);
      await expect(example.locator("p").first()).toHaveText(`${surname}: ${rating}`);
      const expression = example.locator("p").last();
      await expect(expression.locator(":scope > span > span:last-child")).toHaveText(terms);
      await expect(expression).toHaveText(terms.join("+") + "≈ " + rating);
    }
  }
});

test("published team QB and overall weights match the verified blends", async ({ page }) => {
  await page.goto("/about/team-ratings/");
  const content = page.getByTestId("ratings-content-team");
  await expect(content.getByText(/QB value/)).toContainText(/best quarterback at 80% and the backup at 20%/);
  await expect(content.getByText(/overall team rating is/)).toContainText(/50\/50 average between the offensive and defensive rating/);
});

test("header navigation connects About pages on desktop and mobile", async ({ page }) => {
  await expect(page.getByRole("navigation", { name: "About the game" })).toHaveCount(0);
  await page.getByTestId("nav-about").hover();
  await page.getByRole("link", { name: "Team Ratings", exact: true }).click();
  await expect(page.getByTestId("ratings-content-team")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId("mobile-nav-toggle").click();
  await page.getByTestId("mobile-nav-section-about").click();
  await page.getByRole("link", { name: "How the CPU plays" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "How the CPU plays" })).toBeVisible();
  await page.goBack();
  await page.reload();
  await expect(page.getByTestId("ratings-content-team")).toBeVisible();
});
