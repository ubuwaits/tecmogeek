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
pnpm verify:players
pnpm verify:rankings
pnpm verify:lineups
pnpm verify:defense
pnpm verify:offense
pnpm build
pnpm e2e
```

`pnpm verify:players` uses exact Z3 arithmetic to check all eleven individual rating formulas, including position-specific normalization, hitting-power lookups and whole-percent rounding. It uses the current position-group maxima, evaluates each eligible player, and checks the stored ratings in the team and position files.

`pnpm verify:rankings` checks canonical player order and every stored copy of each rank. Skill players, linemen and defensive players rank by displayed rating, then raw hitting power. Quarterbacks rank by displayed rating, and kickers and punters by kicking ability. For complete ties the position file supplies the order. Z3 checks the ordering rules and searches each file for an inversion.

`pnpm verify:lineups` checks the generated running, passing, and balanced lineups for every team roster with Z3. It checks slot eligibility, scores, optimality, and tie-breaking under the [team rating rules](docs/team-ratings.md). A better legal lineup or a preferred equal-score lineup prints as a counterexample and causes a nonzero exit.

`pnpm verify:defense` uses Z3 to prove that the unrounded defensive formula equals the mean of the eleven starters and stays within 0–100 for any real starter ratings in that range. It also compares the generator’s floating-point score with the starter mean for every team roster.

`pnpm verify:offense` proves the running, passing, balanced, offensive, and overall rating formulas over real component scores from 0 to 100. It also recalculates all five ratings from each roster and checks the generator and published data at three-decimal precision.

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
