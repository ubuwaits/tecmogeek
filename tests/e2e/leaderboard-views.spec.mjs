import { expect, test } from "@playwright/test";
import { positions, teamRatingRecords, readRosterPlayers, skillPositions } from "../../scripts/verify/roster-data.mjs";

const teams = teamRatingRecords();
const players = teams.flatMap(({ team }) => readRosterPlayers(team + ".json"));
const rankFields = {
  rushers: "rushing_ranking", receivers: "receiving_ranking",
  "kick-returners": "kick_return_ranking", "punt-returners": "punt_return_ranking",
};

function expectedRow(player) {
  return [player.name, player.position + " " + player.number, "/teams/" + player.teamSlug + "/"];
}

async function renderedRows(rows) {
  return rows.evaluateAll(elements => elements.map(row => [
    row.querySelector("h3").textContent,
    row.querySelector("h4").textContent,
    row.querySelector("a").getAttribute("href"),
  ]));
}

test("all 11 homepage lists show the correct ranked players and team links", async ({ page }) => {
  await page.goto("/");
  const teamNames = new Map(teams.map(team => [team.team, team.full_name]));
  const lists = page.locator("main h3 + ol");
  await expect(lists).toHaveCount(11);
  for (const [slug, eligible] of Object.entries(positions)) {
    const rank = rankFields[slug] ?? "ranking";
    const ranked = players.filter(player => eligible.test(player.position)).sort((a, b) => a[rank] - b[rank]);
    const leaders = slug === "rushers"
      ? ranked.slice(0, 9).filter(player => !["WR2", "WR3"].includes(player.position))
      : ranked.slice(0, 5);
    const heading = page.locator(`main h3:has(a[href="/players/${slug}/"])`);
    const rows = heading.locator("xpath=following-sibling::*[1]").and(lists).getByRole("listitem");
    expect(await renderedRows(rows), slug).toEqual(leaders.map(expectedRow));
    const teamLabels = await rows.getByRole("link").evaluateAll(links => links.map(link => link.getAttribute("aria-label")));
    expect(teamLabels, slug).toEqual(leaders.map(player => teamNames.get(player.teamSlug) + " team page"));
  }
});

const rankingGroups = {
  qb: "QBs", rushers: "rushers", receivers: "receivers", "kick-returners": "kick returners",
  "punt-returners": "punt returners", ol: "OL", dl: "DL", lb: "LBs", "cb-s": "CB & S", k: "kickers", p: "punters",
};

async function checkRankTooltip(page, trigger, slug, label = rankingGroups[slug]) {
  const count = players.filter(player => positions[slug].test(player.position)).length;
  await trigger.focus();
  await expect(page.getByRole("tooltip")).toHaveText(`Out of ${count} ${label}`);
  await trigger.press("Escape");
}

test("rank tooltips use the league population on each player leaderboard", async ({ page }) => {
  for (const slug of Object.keys(rankingGroups)) {
    await page.goto(`/players/${slug}/`);
    await checkRankTooltip(page, page.getByRole("button", { name: "Ranking", exact: true }), slug);
  }
});

test("team rank tooltips use league counts for each position and skill mode", async ({ page }) => {
  await page.goto("/teams/bills/");
  // Keep every header in view; scrolling closes Radix tooltips.
  await page.setViewportSize({ width: 1280, height: await page.locator("body").evaluate(body => body.scrollHeight) });
  for (const slug of ["qb", "ol", "dl", "lb", "cb-s", "k", "p"]) {
    const section = page.getByTestId("team-table-scroll-" + (slug === "cb-s" ? "secondary" : slug));
    await checkRankTooltip(page, section.locator("span[tabindex]").filter({ hasText: / Ranking$/ }), slug);
  }
  for (const [mode, slug] of [["rushing", "rushers"], ["receiving", "receivers"],
    ["kick-return", "kick-returners"], ["punt-return", "punt-returners"]]) {
    await page.getByTestId("team-mode-" + mode).click();
    const section = page.getByTestId("team-skill-table-scroll");
    await checkRankTooltip(page, section.locator("span[tabindex]").filter({ hasText: / Ranking$/ }), slug, "RB, WR & TE");
  }
});

for (const [slug, subset, filter] of [
  ["rushers", /^RB/, "only-rb"], ["receivers", /^(WR|TE)/, "only-wr"],
]) {
  test(`${slug} filter preserves membership and order through sorting and returning to All`, async ({ page }) => {
    const rank = rankFields[slug];
    const all = players.filter(p => skillPositions.test(p.position)).sort((a, b) => a[rank] - b[rank]);
    const selected = all.filter(p => subset.test(p.position));
    await page.goto(`/players/${slug}/`);
    const rows = page.getByTestId("leaderboard-row");
    async function check(expected) {
      expect(await renderedRows(rows)).toEqual(expected.map(expectedRow));
    }
    await check(all);
    await page.getByTestId("filter-" + filter).click();
    await check(selected);
    await checkRankTooltip(page, page.getByRole("button", { name: "Ranking", exact: true }), slug);

    const header = page.getByRole("button", { name: "REC", exact: true });
    // Receptions descending breaks ties by better league rank. Ascending reverses both.
    const byReceptions = (a, b) => b.receptions - a.receptions || a[rank] - b[rank];
    const sorted = [...selected].sort(byReceptions);
    await header.click();
    await check(sorted);
    await header.click();
    await check(sorted.toReversed());
    await page.getByTestId("filter-all").click();
    await check([...all].sort(byReceptions).reverse());
  });
}

test("all 84 team rank cards agree with the ranked league table and source scores", async ({ page }) => {
  expect(teams).toHaveLength(28);
  const expectedCards = new Map(teams.map(({ team }) => [team, []]));
  await page.goto("/teams/");
  for (const [label, button, key] of [
    ["Overall", "Overall", "overall_rating"], ["Offense", "Off", "offensive_rating"], ["Defense", "Def", "defensive_rating"],
  ]) {
    if (label !== "Overall") await page.getByRole("button", { name: button, exact: true }).click();
    const sorted = [...teams].sort((a, b) => b[key] - a[key] || a.full_name.localeCompare(b.full_name, "en"));
    const rows = await page.getByTestId("team-ratings-row").evaluateAll(elements => elements.map(row => [
      row.querySelector("a").pathname, Number(row.querySelector("div > div").textContent),
    ]));
    expect(rows, label).toEqual(sorted.map(({ team }, index) => [`/teams/${team}/`, index + 1]));
    for (const [path, rank] of rows) expectedCards.get(path.split("/")[2]).push([label, "#" + rank]);
  }
  for (const { team, full_name } of teams) {
    await page.goto(`/teams/${team}/`);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText(full_name);
    const cards = page.getByRole("link", { name: "View all team ratings" }).locator("section");
    const actual = await cards.evaluateAll(elements => elements.map(card => Array.from(card.querySelectorAll("p"), p => p.textContent)));
    expect(actual, team).toEqual(expectedCards.get(team));
  }
});

// Left-to-right logos identified on the source sheet, independent of the renderer's team index.
const helmetOrder = ("49ers bears bengals bills broncos browns buccaneers cardinals chargers chiefs colts cowboys " +
  "dolphins eagles falcons giants jets lions oilers packers patriots raiders rams redskins saints seahawks steelers vikings").split(" ");

async function checkHelmet(sprite, cell, large) {
  const size = large ? 60 : 30;
  await expect(sprite).toBeVisible();
  const style = await sprite.evaluate(el => {
    const css = getComputedStyle(el);
    return [css.width, css.height, css.backgroundImage, css.backgroundPosition, css.backgroundSize, css.backgroundRepeat, css.imageRendering];
  });
  expect(style, helmetOrder[cell]).toEqual([
    size + "px", size + "px", expect.stringContaining("/images/helmets-large.png"),
    `${-cell * size}px 50%`, `${28 * size}px`, "no-repeat", large ? "pixelated" : "auto",
  ]);
}

test("small and large helmets use the correct cell for every team", async ({ page }) => {
  expect(helmetOrder.toSorted()).toEqual(teams.map(t => t.team).sort());
  await page.goto("/teams/");
  const digest = await page.evaluate(async () => {
    const sheet = new Image();
    sheet.src = "/images/helmets-large.png";
    await sheet.decode();
    const canvas = new OffscreenCanvas(sheet.naturalWidth, sheet.naturalHeight);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(sheet, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hash = await crypto.subtle.digest("SHA-256", pixels);
    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
  });
  expect(digest).toBe("1e2cd01dad859918e9279cd4ae9d8f1b0556ecd258bc6765ddbd1073d7d4f118");
  for (const [cell, team] of helmetOrder.entries()) {
    const link = page.getByTestId("team-ratings-row").locator(`a[href="/teams/${team}/"]`);
    await checkHelmet(link.locator('span[style*="background-image"]'), cell, false);
  }
  for (const [cell, team] of helmetOrder.entries()) {
    await page.goto(`/teams/${team}/`);
    await checkHelmet(page.locator('h1 span[style*="background-image"]'), cell, true);
  }
});
