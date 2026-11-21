import { expect, test } from "@playwright/test";

test("catch chances follow the selected quarterback and rosters", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about/pass-catch-chances/");
  const table = page.getByRole("table");
  await expect(table.getByRole("columnheader")).toHaveCount(13);
  await expect(table.getByRole("rowheader")).toHaveCount(10);
  const rice = table.getByRole("row", { name: /Jerry Rice/ });
  await expect(rice.getByRole("cell").nth(0)).toHaveText("100.0%");
  await expect(table.getByRole("columnheader").nth(2)).toContainText("Bruce Smith");
  await expect(rice.getByRole("cell").nth(1)).toHaveText("57.8%");
  await page.getByRole("combobox", { name: "Quarterback", exact: true }).click();
  await page.getByRole("option", { name: "Steve Young · QB2", exact: true }).click();
  await expect(rice.getByRole("cell").nth(1)).toHaveText("41.4%");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("combobox", { name: "Defender", exact: true }).click();
  await page.getByRole("option", { name: "Leonard Smith · SS", exact: true }).click();
  await expect(table.getByRole("columnheader")).toHaveCount(3);
  await expect(table.getByRole("columnheader").last()).toContainText("Leonard Smith");
  await expect(rice.getByRole("cell").last()).toHaveText("31.3%");
  await page.getByRole("combobox", { name: "Offense", exact: true }).click();
  await page.getByRole("option", { name: "Buffalo Bills", exact: true }).click();
  await page.getByRole("combobox", { name: "Defense", exact: true }).click();
  await page.getByRole("option", { name: "San Francisco 49ers", exact: true }).click();
  await expect(table.getByRole("rowheader", { name: /Andre Reed/ })).toBeVisible();
  await expect(rice).toHaveCount(0);
  await expect(table.getByRole("columnheader").last()).toContainText("Dave Waymer");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

for (const width of [390, 1440]) {
  test(`opening a picker preserves page layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/about/pass-catch-chances/");
    await page.evaluate(() => document.fonts.ready);
    const picker = page.getByRole("combobox", { name: "Offense", exact: true });
    const heading = page.locator("main h1");
    const before = await heading.boundingBox();
    await picker.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    expect(await heading.boundingBox()).toEqual(before);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();
    expect(await heading.boundingBox()).toEqual(before);
  });
}
