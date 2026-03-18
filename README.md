# tecmogeek.com

Static-export Next.js source for [tecmogeek.com](https://tecmogeek.com), built with the App Router,
TypeScript, and Tailwind CSS v4.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS v4
- Vitest for unit tests
- Playwright for smoke/e2e coverage

## Development

Install dependencies:

```bash
pnpm install
```

Start the local dev server:

```bash
pnpm dev
```

The site reads local JSON files from [`data/`](/Users/chad/source/tecmogeek/data) and emits a static export to `out/`.

## Verification

Run lint, types, unit tests, and the production export build:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run the Playwright smoke suite against the exported static site:

```bash
pnpm e2e
```

## Deployment

`next build` writes the static site to `out/` because the app uses `output: 'export'`.

For static hosting:

1. Run `pnpm build`
2. Publish the contents of `out/`
3. Keep the root static files from `public/`, including `CNAME`, `favicon.png`, and the Google verification HTML

## Project Notes

- Legacy site data lives in local JSON files and is loaded at build time.
- Sprite sheets and historic team/player naming have been preserved.
- The current migration intentionally keeps the original desktop-only layout; responsive work is a separate task.
