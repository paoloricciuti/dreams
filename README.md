# dreams

A public diary of real dreams, each paired with an image. The dreams live in
the author's [atproto](https://atproto.com) repo as custom
`me.ricciuti.dreams.dream` records (images as blobs on the PDS); the site loads
them with SvelteKit [remote functions](https://svelte.dev/docs/kit/remote-functions).

## How it works

- `lexicons/me.ricciuti.dreams.dream.json` — the custom lexicon. After editing
  it, regenerate the TypeScript schemas with `pnpm lex:build` (output goes to
  `src/lib/lexicons/`).
- `src/lib/server/atproto.ts` — resolves the author's handle → DID → PDS and
  lists the dream records with an unauthenticated client (reads are public).
- `src/lib/dreams.remote.ts` — the `query` remote functions the pages await:
  `get_dreams()` and `get_dream(slug)`.
- `src/routes/admin` + `src/lib/admin.remote.ts` — the dashboard at `/admin`
  where new dreams are logged. A `form` remote function uploads the photo to
  the PDS as a blob and writes the record (the title's slug is the record key).

## Logging dreams

Visit `/admin`. The page is guarded by `ADMIN_PASSWORD`; once you're in, fill
the form (title, date, fragment, story, alt text, image — jpg/png/webp/avif,
≤5MB) and it lands in your repo, then redirects to the new dream.

Configuration lives in `.env` (see `.env.example`): `ADMIN_PASSWORD` guards
the dashboard, `ATPROTO_APP_PASSWORD` (an app password from your PDS) lets the
server write to your repo. The handle defaults to `paolo.ricciuti.me`.

## Developing

```sh
pnpm install
pnpm dev
```

## Building

To create a production version of the app:

```sh
pnpm build
```

You can preview the production build with `pnpm preview`.

---

To recreate the underlying project scaffolding:

```sh
pnpm dlx sv@0.16.3 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" playwright sveltekit-adapter="adapter:node" mcp="ide:claude-code,opencode+setup:local" experimental="versions:kit+features:async,remoteFunctions,explicitEnvironmentVariables,handleRenderingErrors" --install pnpm dreams
```
