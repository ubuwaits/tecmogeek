# tecmogeek.com

[tecmogeek.com](https://www.tecmogeek.com) is a static Tecmo Super Bowl roster and ratings site built with Next.js.

## Run locally

Use Node.js 24 and pnpm 10. Run `pnpm install`, then `pnpm dev`.

## Edit a roster

Edit `data/<team>.json` and preserve the player order. Roster slots determine team-page sections and portraits. After an attribute edit, run `pnpm rebuild:all`. Complete ties retain the previous rank for that category. Quarterback, kicker, and punter ratings and ranks are published roster fields maintained by hand.

## Choose checks

| Change | What to run |
| --- | --- |
| Player attributes or ranks | `pnpm verify:players` and `pnpm verify:rankings` against the working rosters |
| Team ratings or lineup selection | `pnpm verify:team-components` and `pnpm verify:lineups`. See the [team-rating rationale](docs/team-ratings.md). |
| Rebuild scripts | `pnpm verify:rebuilds` for byte-for-byte reproducibility and `pnpm verify:rebuild-edits` for simulated edits |
| Pages or components | `pnpm e2e` for the browser suite, or a focused check such as `pnpm verify:portraits`. See the [portrait references](tests/fixtures/portraits/README.md). |

**Reproducibility uses data from `HEAD`.** The check runs the current rebuild scripts against committed data in a temporary checkout. Use the player and team checks above to validate uncommitted roster edits.

## Deploy

Run `pnpm build` to export the site to `out/`. To publish to Cloudflare, run `pnpm deploy` with the `personal` Wrangler profile authenticated. The deploy command includes the build.
