import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);
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
  await page.getByTestId("filter-only-rb").click();

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

test("about rankings redirects to about ratings", async ({ page }) => {
  await page.goto("/about/rankings/");
  await expect(page).toHaveURL(/\/about\/ratings\/$/);
  await expect(page.getByRole("heading", { name: "How player ratings and rankings are calculated" })).toBeVisible();
});

test("verification and favicon files are exported", async ({ request }) => {
  const verification = await request.get("/google146824b99fdbed48.html");
  expect(verification.ok()).toBeTruthy();
  expect(await verification.text()).toContain("google-site-verification");

  const favicon = await request.get("/favicon.png");
  expect(favicon.ok()).toBeTruthy();
});

test.describe("mobile responsive layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile nav opens and routes without overflow", async ({ page }) => {
    await page.goto("/");
    await expectNoHorizontalOverflow(page);

    await page.getByTestId("mobile-nav-toggle").click();
    await expect(page.getByTestId("mobile-nav-panel")).toHaveAttribute("aria-hidden", "false");
    await page.getByTestId("mobile-nav-section-teams").click();
    await expect(page.getByRole("link", { name: /49ers/i })).toBeVisible();
    await page.getByRole("link", { name: "About Ratings" }).last().click();

    await expect(page).toHaveURL(/\/about\/ratings\/$/);
    await expect(
      page.getByRole("heading", { name: "How player ratings and rankings are calculated" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("player filters and team mode toggles still work in mobile cards", async ({ page }) => {
    await page.goto("/players/rushers/");
    await expectNoHorizontalOverflow(page);

    await page.getByTestId("filter-only-rb").click();

    const positions = await page
      .locator("[data-testid='leaderboard-row']")
      .evaluateAll((rows) => rows.map((row) => row.getAttribute("data-position")));

    expect(positions.every((position) => position?.startsWith("RB"))).toBeTruthy();
    await expectNoHorizontalOverflow(page);

    await page.goto("/teams/49ers/");
    await expectNoHorizontalOverflow(page);
    await page.getByTestId("team-mode-receiving").click();

    const firstRow = page.locator("[data-testid='team-skill-row']").first();
    await expect(firstRow).toContainText("Jerry Rice");
    await expect(page.locator("[data-testid='team-skill-section']")).toHaveAttribute(
      "data-mode",
      "receiving",
    );
    await expectNoHorizontalOverflow(page);
  });
});
