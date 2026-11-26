import { expect, it } from "vitest";
import { brokenExportLinks } from "../helpers/export-links";

const site = "https://www.tecmogeek.com";
const assets = new Set(["/images/team logo.png"]);

it("resolves links against the document base, recognizes both site hosts, and decodes paths and fragments", () => {
  const pages = [
    { route: "/about/", base: "../teams/", ids: [], links: [
      "jets/#kick%20return", "../images/team%20logo.png", "https://tecmogeek.com/teams/jets/",
      "https://example.com/missing/", "mailto:reader@example.com",
    ] },
    { route: "/teams/jets/", ids: ["kick return"], links: ["#kick%20return"] },
  ];
  expect(brokenExportLinks(site, pages, assets)).toEqual([]);
});

it("reports missing pages, assets, and anchors with their referring page", () => {
  const pages = [{ route: "/", ids: [], links: ["/images/missing.png", "/absent/", "#missing", "https://tecmogeek.com/absent/"] }];
  expect(brokenExportLinks(site, pages, assets)).toEqual([
    "/ links to missing target /images/missing.png",
    "/ links to missing target /absent/",
    "/ links to missing fragment #missing",
    "/ links to missing target https://tecmogeek.com/absent/",
  ]);
});
