import { readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { expect, test } from "@playwright/test";

import { POSITION_PAGES } from "../../lib/players/config";
import { POSITION_SLUGS, TEAM_SLUGS } from "../../lib/types";

const site = "https://www.tecmogeek.com";
const teams = TEAM_SLUGS.map(slug => `/teams/${slug}/`);
const players = POSITION_SLUGS.map(slug => `/players/${slug}/`);
const routes = ["/", "/about/ratings/", "/about/team-ratings/", "/about/cpu/", "/about/pass-catch-chances/", "/about/plays/", "/teams/", ...teams, ...players];
const output = resolve("out");

const socialTitles = new Map<string, string>([
  ["/", "Comprehensive guide to player attributes and rankings in Tecmo Super Bowl for NES."],
  ["/about/ratings/", "How player ratings are calculated"],
  ["/about/team-ratings/", "How team ratings are calculated"],
  ["/about/cpu/", "How the CPU plays"],
  ["/about/pass-catch-chances/", "Pass Catch Chances"],
  ["/about/plays/", "Offensive Plays"],
  ["/teams/", "Team Ratings"],
]);
for (const slug of TEAM_SLUGS) {
  const roster = JSON.parse(readFileSync(resolve("data", slug + ".json"), "utf8"));
  socialTitles.set(`/teams/${slug}/`, roster.full_name);
}
for (const { slug, title } of POSITION_PAGES) socialTitles.set(`/players/${slug}/`, title);

test("public HTML, canonical URLs, Open Graph tags, sitemap and internal links agree", async ({ page, request }) => {
  const files = readdirSync(output, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile()).map(entry => relative(output, resolve(entry.parentPath, entry.name)));
  const auxiliary = new Set(["404.html", "404/index.html", "_not-found/index.html", "google146824b99fdbed48.html"]);
  const htmlPages = files.filter(file => file.endsWith(".html") && !auxiliary.has(file));
  expect(routes).toHaveLength(46);
  expect(htmlPages.sort()).toEqual(routes.map(route => route.slice(1) + "index.html").sort());

  const sitemap = await request.get("/sitemap.xml", { maxRedirects: 0 });
  expect(sitemap.status()).toBe(200);
  const urls = await page.evaluate(xml => {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const root = doc.documentElement;
    if (root.localName !== "urlset" || root.namespaceURI !== "http://www.sitemaps.org/schemas/sitemap/0.9") {
      throw new Error("Invalid sitemap urlset");
    }
    return Array.from(root.children, url => {
      const locs = url.querySelectorAll(":scope > loc");
      if (url.localName !== "url" || locs.length !== 1) throw new Error("Expected one loc per sitemap URL");
      return locs[0].textContent;
    });
  }, await sitemap.text());
  expect(urls.sort()).toEqual(routes.map(route => site + route).sort());

  const fragments = new Map<string, Set<string>>();
  const internalLinks = [];
  for (const route of routes) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status(), route).toBe(200);
    const parsed = await page.evaluate(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return {
        canonicals: Array.from(doc.querySelectorAll('link[rel~="canonical" i]'), link => link.getAttribute("href")),
        socialUrls: Array.from(doc.querySelectorAll('meta[property="og:url"]'), el => el.getAttribute("content")),
        socialTitles: Array.from(doc.querySelectorAll('meta[property="og:title"]'), el => el.getAttribute("content")),
        base: doc.querySelector("base[href]")?.getAttribute("href"),
        links: Array.from(doc.querySelectorAll("a[href], area[href]"), a => a.getAttribute("href")!),
        ids: [...Array.from(doc.querySelectorAll("[id]"), el => el.id),
          ...Array.from(doc.querySelectorAll("a[name]"), a => a.getAttribute("name")!)],
      };
    }, await response.text());
    expect(parsed.canonicals, route).toEqual([site + route]);
    expect(parsed.socialUrls, route).toEqual([site + route]);
    expect(parsed.socialTitles, route).toEqual([socialTitles.get(route)]);
    fragments.set(route, new Set(parsed.ids));
    const base = new URL(parsed.base ?? "", site + route);
    for (const href of parsed.links) {
      const url = new URL(href, base);
      if (["www.tecmogeek.com", "tecmogeek.com"].includes(url.hostname)) internalLinks.push({ route, href, url });
    }
  }
  const assets = new Set(files.filter(file => !file.endsWith(".html")).map(file => "/" + file));
  for (const { route, href, url } of internalLinks) {
    const path = decodeURIComponent(url.pathname);
    const target = fragments.get(path);
    expect(!!target || assets.has(path), `${route} links to ${href}`).toBe(true);
    if (target && url.hash) expect(target.has(decodeURIComponent(url.hash.slice(1))), `${route} links to ${href}`).toBe(true);
  }
  for (const slug of ["constructor", "toString", "__proto__", "not-a-position"]) {
    expect((await request.get(`/players/${slug}/`, { maxRedirects: 0 })).status(), slug).toBe(404);
  }
});

for (const mobile of [false, true]) {
  test(`${mobile ? "mobile" : "desktop"} navigation links to every team, player, and About page`, async ({ page }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    if (mobile) await page.getByTestId("mobile-nav-toggle").click();
    for (const [menu, expected] of [["teams", ["/teams/", ...teams]], ["players", players], ["about", ["/about/ratings/", "/about/team-ratings/", "/about/cpu/", "/about/pass-catch-chances/", "/about/plays/"]]] as const) {
      const trigger = page.getByTestId(mobile ? "mobile-nav-section-" + menu : "nav-" + menu);
      if (mobile) await trigger.click();
      else await trigger.hover();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      const links = await trigger.locator("..").locator("a[href]").evaluateAll(nodes => nodes.map(a => a.getAttribute("href")));
      expect(links.sort()).toEqual([...expected].sort());
    }
  });
}

test("all eight playbook slots display their eight NES diagrams", async ({ page }) => {
  await page.goto("/about/plays/");
  const slots = page.locator("article section");
  await expect(slots).toHaveCount(8);
  for (let slot = 0; slot < 8; slot++) {
    const group = slots.nth(slot);
    const type = slot < 4 ? "Run" : "Pass";
    const number = slot % 4 + 1;
    await expect(group.getByRole("heading")).toHaveText(`${type} ${number}`);
    const images = group.getByRole("img");
    await expect(images).toHaveCount(8);
    const sources = await images.evaluateAll(async elements => Promise.all(elements.map(async element => {
      const image = element as HTMLImageElement;
      image.loading = "eager";
      await image.decode();
      return [image.getAttribute("src"), image.naturalWidth, image.naturalHeight];
    })));
    expect(sources).toEqual(Array.from({ length: 8 }, (_, index) => [
      `/images/plays/${type[0]}${number}-${index}.png`, 48, 56,
    ]));
  }
});
