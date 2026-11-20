# tecmogeek.com

Source for [tecmogeek.com](https://www.tecmogeek.com), built with Next.js, TypeScript, and Tailwind CSS. Uses local JSON data from `data/` and exports a static site to `out/`.

## Development

Requires Node.js 24 and pnpm 10.

```bash
pnpm install
pnpm dev
```

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm verify:lineups
pnpm build
pnpm e2e
```

`pnpm verify:lineups` checks the generated running, passing, and balanced lineups for every team roster with Z3. It checks slot eligibility, scores, optimality, and tie-breaking under the [team rating rules](docs/team-ratings.md). A better legal lineup or a preferred equal-score lineup prints as a counterexample and causes a nonzero exit.

## Deployment

Build the static site:

```bash
pnpm build
```

Publish `out/` to a static host. Cloudflare Workers Static Assets configuration is included in [`wrangler.jsonc`](wrangler.jsonc).

To deploy with an authenticated Cloudflare account:

```bash
pnpm exec wrangler deploy
```
