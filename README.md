# tecmogeek.com

Static-export Next.js source for [tecmogeek.com](https://tecmogeek.com), built with the App Router, TypeScript, and Tailwind CSS v4.

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

### Vercel

This repo can be deployed to Vercel with the standard Git workflow:

1. Import the repository into Vercel
2. Use the repo root as the Root Directory
3. Keep the Framework Preset as `Next.js`
4. Push to your production branch normally

Vercel should auto-detect `pnpm` from [`package.json`](/Users/chad/source/tecmogeek/package.json) and [`pnpm-lock.yaml`](/Users/chad/source/tecmogeek/pnpm-lock.yaml), so you usually do not need custom install or build commands.

If Vercel does not auto-detect correctly, use:

```bash
Install Command: pnpm install
Build Command: pnpm build
Output Directory: out
```

Custom domains should be configured in Vercel project settings.

### Other Static Hosting

For any static host that can publish a directory:

1. Run `pnpm build`
2. Publish the contents of `out/`

### Static Export Constraints

Because the site uses `output: 'export'`, avoid introducing features that require a Next.js server at request time. In particular, do not depend on:

- redirects or rewrites in `next.config`
- custom response headers
- cookies, Draft Mode, or Server Actions
- ISR or other request-time regeneration
- dynamic routes without `generateStaticParams()`
- `next/image` with the default image optimization loader

## Project Notes

- Legacy site data lives in local JSON files and is loaded at build time.
- Sprite sheets and historic team/player naming have been preserved.
- The current migration intentionally keeps the original desktop-only layout; responsive work is a separate task.
