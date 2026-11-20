# tecmogeek.com

Source for [tecmogeek.com](https://www.tecmogeek.com), built with Next.js, TypeScript, and Tailwind CSS. Uses local JSON data from `data/` and exports a static site to `out/`.

## Development

Requires Node.js 24 and pnpm 10.

```bash
pnpm install
pnpm dev
```

## Player data

Edit a player in `data/<team>.json`. Keep the roster slot order, which determines the team-page sections and portraits. The 11 leaderboards select players from these rosters and sort by the stored rank for that category.

After an attribute edit, run `pnpm rebuild:offense`, `pnpm rebuild:defense`, then `pnpm rebuild:team-ratings`. The player rebuilds recalculate skill, offensive-line, and defensive ratings across the league. Complete ties retain the previous rank for that category. Return speeds come from the team’s RT and SS. Quarterback, kicker, and punter ratings and ranks are published roster fields checked by the player verifiers.

## Checks

The data generators live in `scripts/rebuild/`. The Node verification scripts live in `scripts/verify/`, grouped by players, teams, lineups, and rebuilds. Browser checks live in `tests/e2e/`. Run them through the pnpm commands below.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm verify:routes
pnpm verify:rebuilds
pnpm verify:rebuild-edits
pnpm verify:lineup-precision
pnpm verify:team-rounding
pnpm verify:table-transitions
pnpm verify:skill-selector
pnpm verify:players
pnpm verify:portraits
pnpm verify:attributes
pnpm verify:about-ratings
pnpm verify:leaderboard-views
pnpm verify:rankings
pnpm verify:player-sorting
pnpm verify:team-rankings
pnpm verify:team-components
pnpm verify:lineups
pnpm verify:defense
pnpm verify:offense
pnpm build
pnpm e2e
```

`pnpm verify:routes` builds the static export and checks the 42 public pages, their canonical URLs, the complete sitemap, internal hyperlinks, and the desktop and mobile navigation menus.

`pnpm verify:rebuilds` runs the offense, defense, and team-rating commands twice in one temporary checkout. It uses the current package commands and scripts with data from `HEAD`. After each pass it checks the complete file list and compares every data file byte-for-byte with its committed Git blob.

`pnpm verify:rebuild-edits` runs all three rebuilds on two independent edits in a temporary checkout. Each edit changes one raw field in the Eagles roster. The check recomputes every defensive line rating and rank, checks all rosters and team outputs, and exercises a new league maximum.

`pnpm verify:lineup-precision` uses Z3 to bound binary64 error in the generator's running, passing, and balanced score expressions for whole-percent inputs from 0 to 100. It checks score ordering and tolerance ties against exact multiples of 1/8000, then exercises the numeric comparator across the entire score grid.

`pnpm verify:team-rounding` checks all 16 stored values per team using integer arithmetic. At exact half-thousandths it preserves the published rounding convention by decoding the generator's unrounded binary64 value and independently rounding that fraction to three decimals. It lists each midpoint and its decimal half-up alternative.

`pnpm verify:skill-selector` checks every team skill-mode transition through both responsive controls against roster ranks, ratings, row order, links, metrics, labels, and mode notes.

`pnpm verify:table-transitions` traverses the reachable sort, filter, and column-expansion states in Chromium on all 11 position tables and the league table. Every available action is exercised from each reachable state, including collapsing a group while sorting by one of its columns.

`pnpm verify:leaderboard-views` checks the 11 homepage lists, both position filters through sort changes, all 84 team rank cards against league standings, and both helmet sizes for all 28 teams against the inspected sprite sheet.

`pnpm verify:about-ratings` checks the exported explanation against the player weights, hitting-power lookups, and published team blends. It recomputes the Rice and Jackson examples from team rosters, checking the displayed attribute scores, equation terms, two-decimal totals, and whole-percent roster ratings.

`pnpm verify:attributes` checks rendered metric values, accessible names, gradient fills, and bar and header weights against the rosters and position-column specifications. It covers every position leaderboard and all four skill modes on every team page, including return speeds sourced from RT and SS.

`pnpm verify:portraits` checks roster sections, rendered portrait cells and decoded sprite pixels for all 840 players across team pages and position leaderboards. See the [portrait references](tests/fixtures/portraits/README.md) for the game face IDs and pixel baselines.

`pnpm verify:players` uses exact Z3 arithmetic to check all eleven individual rating formulas, including position-specific normalization, hitting-power lookups and whole-percent rounding. It uses the current position-group maxima, evaluates each eligible player, and checks the stored roster ratings.

`pnpm verify:rankings` checks canonical leaderboard order and each stored roster rank. Skill players, linemen and defensive players rank by displayed rating, then raw hitting power. Quarterbacks rank by displayed rating, and kickers and punters by kicking ability. For complete ties the previous category rank supplies the order. Z3 checks the ordering rules and searches each leaderboard for an inversion.

`pnpm verify:player-sorting` checks the player tables’ production sorter against a Z3 ordering rule for every ranking, rating and metric column, in both directions and in each configured position filter. Equal values use canonical rank (best first descending, worst first ascending). Complete ties retain input order.

`pnpm verify:team-rankings` checks all nine team rating columns in both sort directions and the three summary-card ranks for every team. Sorting uses stored score precision and breaks exact ties alphabetically by full team name in both directions. Table rows keep their descending rank in either direction, including within exact ties. Summary cards use the same descending ranks.

`pnpm verify:lineups` checks the generated running, passing, and balanced lineups for every team roster with Z3. It checks slot eligibility, scores, optimality, and tie-breaking under the [team rating rules](docs/team-ratings.md). After each of the 252 five-player subsets in each search, the verifier compares the actual incumbent with the highest exact score and preferred signature over the entire prefix. A better legal lineup or a preferred equal-score lineup prints as a counterexample and causes a nonzero exit.

`pnpm verify:defense` uses Z3 to prove that the unrounded defensive formula equals the mean of the eleven starters and stays within 0–100 for any real starter ratings in that range. It also compares the generator’s floating-point score with the starter mean for every team roster.

`pnpm verify:offense` proves the running, passing, balanced, offensive, and overall rating formulas over real component scores from 0 to 100. It also recalculates all five ratings from each roster and checks the generator and published data at three-decimal precision.

`pnpm verify:team-components` checks every stored component and selected-player label in `data/team-ratings.json` against source rosters. Z3 checks the published lineup slots for legality, optimality and tie-breaking. Component checks use the published three-decimal precision and allow either nearest value at an exact rounding midpoint.

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
