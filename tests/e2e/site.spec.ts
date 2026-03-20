import { expect, test, type Locator, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
}

async function expectLocalHorizontalOverflow(locator: Locator) {
  const dimensions = await locator.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));

  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
}

test("home page renders leaderboards", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Comprehensive guide to player attributes in Tecmo Super Bowl for NES.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Top Quarterbacks/i })).toBeVisible();
});

test("rushers page filters down to RB entries", async ({ page }) => {
  await page.goto("/players/rushers/");
  const onlyRbTab = page.getByTestId("filter-only-rb");
  await expect(onlyRbTab).toHaveCSS("cursor", "pointer");
  await onlyRbTab.click();

  const positions = await page
    .locator("[data-testid='leaderboard-row']")
    .evaluateAll((rows) => rows.map((row) => row.getAttribute("data-position")));

  expect(positions.every((position) => position?.startsWith("RB"))).toBeTruthy();
});

test("team page mode toggle re-sorts the skill section", async ({ page }) => {
  await page.goto("/teams/49ers/");
  await page.getByTestId("team-mode-receiving").click();

  const firstRow = page.locator("[data-testid='team-skill-row']").first();
  await expect(firstRow).toContainText("Jerry Rice");
  await expect(page.locator("[data-testid='team-skill-section']")).toHaveAttribute(
    "data-mode",
    "receiving",
  );
});

test("verification, metadata, and favicon files are exported", async ({ request }) => {
  const verification = await request.get("/google146824b99fdbed48.html");
  expect(verification.ok()).toBeTruthy();
  expect(await verification.text()).toContain("google-site-verification");

  const favicon = await request.get("/favicon.png");
  expect(favicon.ok()).toBeTruthy();

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Sitemap: https://tecmogeek.com/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("<loc>https://tecmogeek.com/</loc>");
  expect(sitemapText).toContain("<loc>https://tecmogeek.com/about/ratings/</loc>");
  expect(sitemapText).toContain("<loc>https://tecmogeek.com/players/qb/</loc>");
  expect(sitemapText).toContain("<loc>https://tecmogeek.com/teams/49ers/</loc>");
});

test.describe("mobile responsive layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile nav opens and routes without overflow", async ({ page }) => {
    await page.goto("/");
    await expectNoHorizontalOverflow(page);

    await page.getByTestId("mobile-nav-toggle").click();
    await expect(page.getByTestId("mobile-nav-panel")).toHaveAttribute("aria-hidden", "false");
    await expect(page.getByTestId("mobile-nav-section-teams")).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("mobile-nav-section-players")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(page.getByRole("link", { name: /Bills/i })).toHaveCount(0);
    await page.getByTestId("mobile-nav-section-teams").click();
    await expect(page.getByTestId("mobile-nav-section-teams")).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /Bills/i })).toBeVisible();
    await page.getByRole("link", { name: "About Ratings" }).last().click();

    await expect(page).toHaveURL(/\/about\/ratings\/$/);
    await expect(
      page.getByRole("heading", { name: "How player ratings and rankings are calculated" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("player and team tables scroll locally on mobile", async ({ page }) => {
    await page.goto("/players/rushers/");
    await expectNoHorizontalOverflow(page);
    const playerScroller = page.getByTestId("player-table-scroll");
    await expectLocalHorizontalOverflow(playerScroller);

    await page.getByTestId("player-filter-select").selectOption("only-rb");

    const positions = await page
      .locator("[data-testid='leaderboard-row']")
      .evaluateAll((rows) => rows.map((row) => row.getAttribute("data-position")));

    expect(positions.every((position) => position?.startsWith("RB"))).toBeTruthy();
    await playerScroller.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    await playerScroller.getByRole("button", { name: "REC" }).click();

    const receptionValues = await page
      .locator("[data-testid='leaderboard-row'] [data-metric-key='receptions']")
      .evaluateAll((bars) => bars.map((bar) => Number(bar.textContent?.trim() ?? "0")));

    expect(
      receptionValues.every((value, index, values) => index === 0 || values[index - 1] >= value),
    ).toBeTruthy();
    await expectLocalHorizontalOverflow(playerScroller);
    await expectNoHorizontalOverflow(page);

    await page.goto("/teams/49ers/");
    await expectNoHorizontalOverflow(page);
    const teamScroller = page.getByTestId("team-skill-table-scroll");
    await expectLocalHorizontalOverflow(teamScroller);
    await page.getByTestId("team-mode-select").selectOption("receiving");

    const firstRow = page.locator("[data-testid='team-skill-row']").first();
    await expect(firstRow).toContainText("Jerry Rice");
    await expect(page.locator("[data-testid='team-skill-section']")).toHaveAttribute(
      "data-mode",
      "receiving",
    );
    await expectLocalHorizontalOverflow(teamScroller);
    await expectNoHorizontalOverflow(page);
  });
});
