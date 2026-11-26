import { expect, test, type Locator, type Page } from "@playwright/test";

const siteUrl = "https://www.tecmogeek.com";

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

test("desktop navigation opens on hover and stays open over its links", async ({ page }) => {
  await page.goto("/");
  const teams = page.getByTestId("nav-teams");
  const players = page.getByTestId("nav-players");
  await teams.hover();
  await expect(teams).toHaveAttribute("aria-expanded", "true");
  await teams.click();
  await page.getByRole("navigation").getByRole("link", { name: "Team Ratings" }).hover();
  await expect(teams).toHaveAttribute("aria-expanded", "true");
  await players.hover();
  await expect(teams).toHaveAttribute("aria-expanded", "false");
  await expect(players).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "About the game" }).hover();
  await expect(players).toHaveAttribute("aria-expanded", "false");

  await teams.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("navigation").getByRole("link", { name: "Team Ratings" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(teams).toBeFocused();
  await expect(teams).toHaveAttribute("aria-expanded", "false");
});

test("team ratings page renders the ratings table", async ({ page }) => {
  await page.goto("/teams/");

  await expect(page.getByRole("heading", { name: "Team Ratings" })).toBeVisible();
  await expect(page.getByTestId("team-ratings-table-scroll")).toBeVisible();
  await expect(page.locator("[data-testid='team-ratings-row']")).toHaveCount(28);
});

test("player rating sort keeps ranking values ordered through ties", async ({ page }) => {
  await page.goto("/players/rushers/");
  const ratingHeader = page.getByRole("button", { name: "Rating" });
  await ratingHeader.click();

  const firstClickRanks = await page
    .locator("[data-testid='leaderboard-row'] > div > div:nth-child(1)")
    .evaluateAll((cells) => cells.map((cell) => Number.parseInt(cell.textContent?.trim() ?? "0", 10)));

  expect(
    firstClickRanks.every((value, index, values) => index === 0 || values[index - 1] >= value),
  ).toBeTruthy();

  await ratingHeader.click();

  const secondClickRanks = await page
    .locator("[data-testid='leaderboard-row'] > div > div:nth-child(1)")
    .evaluateAll((cells) => cells.map((cell) => Number.parseInt(cell.textContent?.trim() ?? "0", 10)));

  expect(
    secondClickRanks.every((value, index, values) => index === 0 || values[index - 1] <= value),
  ).toBeTruthy();
});

test("team ratings header clicks toggle sort direction", async ({ page }) => {
  await page.goto("/teams/");
  const offenseHeader = page.getByRole("button", { name: "Off" }).first();
  await offenseHeader.click();

  const descendingValues = await page
    .locator("[data-testid='team-ratings-row'] > div > div:nth-child(4)")
    .evaluateAll((cells) => cells.map((cell) => Number.parseFloat(cell.textContent?.trim() ?? "0")));
  const descendingRanks = await page
    .locator("[data-testid='team-ratings-row'] > div > div:nth-child(1)")
    .evaluateAll((cells) => cells.map((cell) => Number.parseInt(cell.textContent?.trim() ?? "0", 10)));

  expect(
    descendingValues.every((value, index, values) => index === 0 || values[index - 1] >= value),
  ).toBeTruthy();
  expect(descendingRanks[0]).toBe(1);

  await offenseHeader.click();

  const ascendingValues = await page
    .locator("[data-testid='team-ratings-row'] > div > div:nth-child(4)")
    .evaluateAll((cells) => cells.map((cell) => Number.parseFloat(cell.textContent?.trim() ?? "0")));
  const ascendingRanks = await page
    .locator("[data-testid='team-ratings-row'] > div > div:nth-child(1)")
    .evaluateAll((cells) => cells.map((cell) => Number.parseInt(cell.textContent?.trim() ?? "0", 10)));

  expect(
    ascendingValues.every((value, index, values) => index === 0 || values[index - 1] <= value),
  ).toBeTruthy();
  expect(ascendingRanks[0]).toBe(28);
});

test("team page mode toggle re-sorts the skill section", async ({ page }) => {
  await page.goto("/teams/49ers/");
  await expect(
    page.getByTestId("team-skill-table-scroll").getByText("Rushing Ranking"),
  ).toHaveCSS("cursor", "auto");
  await page.getByTestId("team-mode-receiving").click();

  const firstRow = page.locator("[data-testid='team-skill-row']").first();
  await expect(firstRow).toContainText("Jerry Rice");
  await expect(page.locator("[data-testid='team-skill-section']")).toHaveAttribute(
    "data-mode",
    "receiving",
  );
});

test("About the game links directly to the team ratings explanation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "About the game" }).hover();
  await page.getByRole("link", { name: "Team Ratings", exact: true }).click();
  await expect(page).toHaveURL(/\/about\/team-ratings\/$/);
  await expect(page.getByRole("heading", { name: "What team ratings measure" })).toBeVisible();
});

test("verification, metadata, and favicon files are exported", async ({ request }) => {
  const verification = await request.get("/google146824b99fdbed48.html");
  expect(verification.ok()).toBeTruthy();
  expect(await verification.text()).toContain("google-site-verification");

  const favicon = await request.get("/favicon.png");
  expect(favicon.ok()).toBeTruthy();

  const socialImage = await request.get("/social-image.png");
  expect(socialImage.ok()).toBeTruthy();

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain(`Sitemap: ${siteUrl}/sitemap.xml`);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain(`<loc>${siteUrl}/</loc>`);
  expect(sitemapText).toContain(`<loc>${siteUrl}/about/ratings/</loc>`);
  expect(sitemapText).toContain(`<loc>${siteUrl}/teams/</loc>`);
  expect(sitemapText).toContain(`<loc>${siteUrl}/players/qb/</loc>`);
  expect(sitemapText).toContain(`<loc>${siteUrl}/teams/49ers/</loc>`);

  const aboutRatings = await request.get("/about/ratings/");
  expect(aboutRatings.ok()).toBeTruthy();
  const aboutRatingsHtml = await aboutRatings.text();
  expect(aboutRatingsHtml).toContain(`property="og:image" content="${siteUrl}/social-image.png"`);
  expect(aboutRatingsHtml).toContain(`name="twitter:image" content="${siteUrl}/social-image.png"`);
});

test.describe("mobile responsive layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile nav opens and routes without overflow", async ({ page }) => {
    await page.goto("/");
    await expectNoHorizontalOverflow(page);

    const panel = page.getByTestId("mobile-nav-panel");
    await page.getByTestId("mobile-nav-toggle").click();
    await expect(panel).toHaveAttribute("aria-hidden", "false");
    await expect(page.getByTestId("mobile-nav-section-teams")).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("mobile-nav-section-players")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(panel.getByRole("link", { name: /Bills/i })).toHaveCount(0);
    await page.getByTestId("mobile-nav-section-teams").click();
    await expect(page.getByTestId("mobile-nav-section-teams")).toHaveAttribute("aria-expanded", "true");
    await expect(panel.getByRole("link", { name: /Bills/i })).toBeVisible();
    await panel.getByRole("button", { name: "About the game" }).click();
    await panel.getByRole("link", { name: "Player Ratings" }).click();

    await expect(page).toHaveURL(/\/about\/ratings\/$/);
    await expect(
      page.getByRole("heading", { name: "How player ratings are calculated" }),
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

    await page.goto("/teams/");
    await expectNoHorizontalOverflow(page);
    const teamRatingsScroller = page.getByTestId("team-ratings-table-scroll");
    await expectLocalHorizontalOverflow(teamRatingsScroller);
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
