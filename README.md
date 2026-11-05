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
pnpm build
pnpm e2e
```

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
