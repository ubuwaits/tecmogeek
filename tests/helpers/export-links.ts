export type ExportPageLinks = {
  route: string;
  base?: string | null;
  links: string[];
  ids: string[];
};

export function brokenExportLinks(site: string, pages: readonly ExportPageLinks[], assets: ReadonlySet<string>) {
  const hostname = new URL(site).hostname.replace(/^www\./, "");
  const fragments = new Map(pages.map(page => [page.route, new Set(page.ids)]));
  const broken: string[] = [];
  for (const page of pages) {
    const base = new URL(page.base ?? "", new URL(page.route, site));
    for (const href of page.links) {
      const url = new URL(href, base);
      if (url.hostname !== hostname && url.hostname !== "www." + hostname) continue;
      const path = decodeURIComponent(url.pathname);
      const ids = fragments.get(path);
      if (!ids && !assets.has(path)) broken.push(`${page.route} links to missing target ${href}`);
      if (ids && url.hash && !ids.has(decodeURIComponent(url.hash.slice(1)))) {
        broken.push(`${page.route} links to missing fragment ${href}`);
      }
    }
  }
  return broken;
}
