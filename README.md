# tecmogeek.com

Static-export Next.js source for [tecmogeek.com](https://www.tecmogeek.com), built with the App Router, TypeScript, and Tailwind CSS v4.

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

### Cloudflare Workers Static Assets

The site deploys the `out/` export as Cloudflare Workers Static Assets. Wrangler
configuration is source-controlled in [`wrangler.jsonc`](/Users/chad/source/tecmogeek/wrangler.jsonc).

Validate the production build and deployment configuration without uploading:

```bash
pnpm deploy:check
```

Deploy from a local checkout using the separately authenticated personal
Cloudflare profile:

```bash
pnpm deploy
```

For Cloudflare Workers Builds, use:

```text
Build command: pnpm build
Deploy command: pnpm exec wrangler deploy
```

The Workers Build environment supplies its own deployment token, so its deploy
command intentionally does not select the local `personal` profile.

The `www.tecmogeek.com` and `tecmogeek.com` custom domains are declared in
`wrangler.jsonc`, which is the source of truth for Worker routing. The Worker
serves the site on `www` and permanently redirects the apex hostname to the
same path and query string on `www`.

Keep the previous host available until DNS has propagated and both hostnames
have passed production smoke tests.

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
