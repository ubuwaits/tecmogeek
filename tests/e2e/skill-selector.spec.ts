import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { POSITION_PAGE_CONFIG_MAP } from "../../lib/players/config";
import { TEAM_SLUGS, type TeamData } from "../../lib/types";

const modes = [
  { id: "rushing", title: "Rushing", slug: "rushers" },
  { id: "receiving", title: "Receiving", slug: "receivers" },
  { id: "kick-return", title: "Kick Returning", slug: "kick-returners" },
  { id: "punt-return", title: "Punt Returning", slug: "punt-returners" },
] as const;

// Starting and ending in rushing, this visits every ordered pair exactly once.
const tour = [0, 0, 1, 0, 2, 0, 3, 1, 1, 2, 1, 3, 2, 2, 3, 3, 0];
const desktop = { width: 1024, height: 844 };
const mobile = { width: 390, height: 844 };

for (const team of TEAM_SLUGS) {
  test(`${team} skill mode is independent of previous mode and control`, async ({ page }) => {
    const roster: TeamData = JSON.parse(readFileSync(`data/${team}.json`, "utf8"));
    const skill = roster.players.filter(p => /^(RB|WR|TE)\d+$/.test(p.position));
    expect(skill).toHaveLength(10);
    await page.goto(`/teams/${team}/`);
    const section = page.getByTestId("team-skill-section");
    const select = section.getByRole("combobox", { includeHidden: true });

    async function check(index: number) {
      const { id, title, slug } = modes[index];
      const config = POSITION_PAGE_CONFIG_MAP[slug];
      await expect(section).toHaveAttribute("data-mode", id);
      await expect(select).toHaveValue(id);
      await expect(section.locator('[role="tab"][aria-selected="true"]')).toHaveText(title);
      await expect(section.locator("p").last()).toHaveText(config.note);
      const header = section.locator("ol > li").first();
      await expect(header.locator(":scope > div:first-child")).toHaveText(title + " Ranking");
      await expect(header.locator(":scope > div:last-child > div")).toHaveText(config.columns.map(c => c.label));

      const actual = await section.getByTestId("team-skill-row").evaluateAll(rows => rows.map(row => {
        const link = row.querySelector("a")!;
        return {
          name: row.querySelector("h3")!.textContent, position: row.querySelector("h4")!.textContent,
          rank: row.querySelector(":scope > div > div:first-child")!.textContent,
          rating: link.textContent, href: link.getAttribute("href"),
          metrics: Array.from(row.querySelectorAll("[data-metric-key]"), bar => [bar.getAttribute("data-metric-key"), bar.textContent]),
        };
      }));
      const ordered = [...skill].sort((a, b) => Number(a[config.rankingKey]) - Number(b[config.rankingKey]));
      expect(actual, team + " " + id).toEqual(ordered.map(p => ({
        name: p.name, position: p.position + " " + p.number, rank: String(p[config.rankingKey]),
        rating: p[config.ratingKey], href: `/players/${slug}/`,
        metrics: config.columns.map(c => [c.key, String(p[c.key])]),
      })));
    }

    await check(0);
    for (const pass of [0, 1]) {
      for (const [step, index] of tour.slice(1).entries()) {
        const useMobile = (step + pass) % 2 === 0;
        await page.setViewportSize(useMobile ? mobile : desktop);
        if (useMobile) await select.selectOption(modes[index].id);
        else await section.getByRole("tab", { name: modes[index].title, exact: true }).click();
        await check(index);
      }
    }
  });
}
