import { expect, test } from "@playwright/test";

const mobile = { width: 390, height: 844 };
const desktop = { width: 1024, height: 844 };

test.describe("top navigation across input methods and viewport sizes", () => {
  test.use({ hasTouch: true, viewport: desktop });

  test("one desktop trigger handles touch, mouse, then keyboard", async ({ page }) => {
    await page.goto("/");
    const teams = page.getByTestId("nav-teams");
    await teams.tap();
    await expect(teams).toHaveAttribute("aria-expanded", "true");
    await teams.tap();
    await expect(teams).toHaveAttribute("aria-expanded", "false");

    await teams.hover();
    await teams.click();
    await expect(teams).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Space");
    await expect(teams).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("navigation").getByRole("link", { name: "Team Ratings" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(teams).toBeFocused();
    await expect(teams).toHaveAttribute("aria-expanded", "false");
  });

  test("an open mobile section survives a round trip through desktop layout", async ({ page }) => {
    await page.setViewportSize(mobile);
    await page.goto("/");
    const toggle = page.getByTestId("mobile-nav-toggle");
    const panel = page.getByTestId("mobile-nav-panel");
    const players = page.getByTestId("mobile-nav-section-players");
    await toggle.tap();
    await players.tap();
    const quarterbacks = panel.getByRole("link", { name: "Quarterbacks", exact: true });
    await expect(quarterbacks).toBeVisible();

    await page.setViewportSize(desktop);
    await expect(panel).toBeHidden();
    await page.getByTestId("nav-teams").hover();
    await expect(page.getByTestId("nav-teams")).toHaveAttribute("aria-expanded", "true");

    await page.setViewportSize(mobile);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(players).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toHaveAttribute("aria-hidden", "false");
    await expect(panel).toHaveJSProperty("inert", false);
    await expect(quarterbacks).toBeVisible();
  });

  test("Escape on desktop also dismisses a mobile section hidden by resize", async ({ page }) => {
    await page.setViewportSize(mobile);
    await page.goto("/");
    await page.getByTestId("mobile-nav-toggle").tap();
    const teams = page.getByTestId("mobile-nav-section-teams");
    await teams.tap();
    await expect(teams).toHaveAttribute("aria-expanded", "true");
    await page.setViewportSize(desktop);
    const players = page.getByTestId("nav-players");
    await players.hover();
    await expect(players).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(players).toHaveAttribute("aria-expanded", "false");

    await page.setViewportSize(mobile);
    await expect(page.getByTestId("mobile-nav-toggle")).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("mobile-nav-panel")).toHaveJSProperty("inert", true);
    await page.getByTestId("mobile-nav-toggle").tap();
    await expect(teams).toHaveAttribute("aria-expanded", "false");
  });
});
