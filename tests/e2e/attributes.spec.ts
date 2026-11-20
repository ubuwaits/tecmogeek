import { readTestRoster } from "../helpers/rosters";
import { expect, test, type Locator } from "@playwright/test";

import { POSITION_PAGES } from "../../lib/players/config";
import { TEAM_SLUGS, type PositionPageConfig, type PositionSlug } from "../../lib/types";

const skill = /^(RB|WR|TE)\d+$/;
const positions: Record<PositionSlug, RegExp> = {
  qb: /^QB\d+$/, ol: /^(C|LG|RG|LT|RT)$/, dl: /^(LE|RE|NT)$/,
  lb: /^(LILB|RILB|LOLB|ROLB)$/, "cb-s": /^(RCB|LCB|FS|SS)$/, k: /^K$/, p: /^P$/,
  rushers: skill, receivers: skill, "kick-returners": skill, "punt-returners": skill,
};
const modes = new Map([["rushers", "rushing"], ["receivers", "receiving"],
  ["kick-returners", "kick-return"], ["punt-returners", "punt-return"]]);
const rosters = TEAM_SLUGS.map(readTestRoster);
const allPlayers = rosters.flatMap(team => team.players);

async function checkTable(table: Locator, config: PositionPageConfig, roster: typeof allPlayers, team?: (typeof rosters)[number]) {
  const eligible = roster.filter(player => positions[config.slug].test(player.position));
  const expected = eligible.map(player => ({
    id: [player.teamSlug, player.position, player.name].join("|"),
    bars: config.columns.map(({ key, tooltip, weight }) => {
      const value = player[key];
      expect(typeof value, `${player.name}: missing ${key}`).toBe("number");
      return { key, text: String(value), label: `${tooltip}: ${value}`, weight: String(weight), fill: value };
    }),
  }));

  const actual = await table.evaluate((element, teamSlug) => {
    // Read the browser's resolved gradient, including direction, colors and stop positions.
    const probe = document.createElement("span");
    element.append(probe);
    const fills = new Map<string, number>();
    for (let value = 0; value <= 100; value++) {
      probe.style.backgroundImage = `linear-gradient(to right, var(--pink) 0%, var(--pink) ${value}%, transparent ${value}%)`;
      fills.set(getComputedStyle(probe).backgroundImage, value);
    }
    probe.remove();
    const header = element.querySelector("ol > li:first-child")!;
    const headers = Array.from(header.querySelectorAll(":scope > div:last-child > div"), cell => ({
      label: cell.textContent, weight: getComputedStyle(cell).flexGrow,
    }));
    const rows = Array.from(element.querySelectorAll("ol > li:not(:first-child)"), row => {
      const slug = teamSlug ?? row.querySelector<HTMLAnchorElement>('a[href^="/teams/"]')!.pathname.split("/")[2];
      const id = [slug, row.querySelector("h4")!.textContent!.split(" ")[0], row.querySelector("h3")!.textContent].join("|");
      const bars = Array.from(row.querySelectorAll("[data-metric-key]"), bar => {
        const style = getComputedStyle(bar);
        return { key: bar.getAttribute("data-metric-key"), text: bar.textContent, label: bar.getAttribute("aria-label"),
          weight: style.flexGrow, fill: fills.get(style.backgroundImage) ?? style.backgroundImage };
      });
      return { id, bars };
    });
    return { headers, rows };
  }, team?.slug);

  expect(actual.headers).toEqual(config.columns.map(column => ({ label: column.label, weight: String(column.weight) })));
  const byId = new Map(expected.map(row => [row.id, row.bars]));
  expect(actual.rows).toHaveLength(expected.length);
  const expectedNames: string[] = [];
  for (const { id, bars } of actual.rows) {
    expect(bars, `${config.slug}: ${id}`).toEqual(byId.get(id));
    expectedNames.push(...byId.get(id)!.map(bar => bar.label));
    byId.delete(id);
  }
  expect(byId.size).toBe(0);

  // Check names exposed to assistive technology as well as the label on each specific bar.
  const snapshot = await table.ariaSnapshot();
  const names = Array.from(snapshot.matchAll(/^\s*- '?img "([^"]+)"/gm), match => match[1]);
  expect(names).toEqual(expectedNames);
}

for (const config of POSITION_PAGES) {
  test(`${config.slug} leaderboard metric bars`, async ({ page }) => {
    expect(allPlayers).toHaveLength(840);
    await page.goto(`/players/${config.slug}/`);
    await checkTable(page.getByTestId("player-table-scroll"), config, allPlayers);
  });
}

for (const team of rosters) {
  test(`${team.slug} team metric bars`, async ({ page }) => {
    expect(team.players).toHaveLength(30);
    await page.goto(`/teams/${team.slug}/`);
    for (const config of POSITION_PAGES) {
      const mode = modes.get(config.slug);
      if (mode) {
        await page.getByTestId("team-mode-" + mode).click();
        await expect(page.getByTestId("team-skill-section")).toHaveAttribute("data-mode", mode);
        await checkTable(page.getByTestId("team-skill-table-scroll"), config, team.players, team);
      } else {
        const section = config.slug === "cb-s" ? "secondary" : config.slug;
        await checkTable(page.getByTestId("team-table-scroll-" + section), config, team.players, team);
      }
    }
  });
}
