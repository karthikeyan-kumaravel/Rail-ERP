# Workflow: Deployment

## Current state: no deployment configuration exists

There is no `Dockerfile`, `docker-compose.yml`, Forge/Envoyer config, Fly/
Vercel/Render config, or deploy step in any GitHub Actions workflow in this
repo — `.github/workflows/` contains only `lint.yml` and `tests.yml` (CI
checks, not deployment). Don't assume any of these exist or describe a
deployment process as if it were already automated.

## What running/bootstrapping the app locally actually looks like

The closest thing to a documented "deploy" is `composer.json`'s `setup`
script, intended for a fresh environment:

```bash
composer install
# copy .env.example to .env if missing
php artisan key:generate
php artisan migrate --force
npm install
npm run build
```

And for local development, `composer run dev` runs `php artisan serve` +
`php artisan queue:listen --tries=1` + `npm run dev` concurrently — this is
a **dev** workflow (Vite dev server, not a production build), not a
deployment target.

## If asked to actually deploy or containerize this app

That's real infrastructure work, not something to improvise silently.
Surface the gap and confirm with whoever owns infrastructure before
proceeding — at minimum this needs decisions on:

- **Target platform.** The Laravel Boost guidelines in `CLAUDE.md` name
  Laravel Cloud as the framework-recommended default, but nothing in this
  repo confirms that's where it actually runs (no `.laravel-cloud/` config,
  no other IaC).
- **Database**: dev uses MySQL locally; confirm the production DB target
  and connection config rather than assuming MySQL-as-configured-locally is
  production-ready as-is.
- **Queue/session drivers**: `.env.example` defaults to `SESSION_DRIVER=database`
  and file-based queues aren't configured beyond the default sync driver
  implied by `queue:listen` in the dev script — a real deployment needs a
  deliberate choice here (Redis, database queue, etc.), not just copying
  local `.env` defaults.
- **Asset build step**: `npm run build` must run as part of any deploy
  pipeline — Vite's manifest is required for Blade's `@vite` directive to
  resolve assets in production (see the "Frontend Bundling" note in
  `CLAUDE.md`: a missing build shows up as a `ViteException`).

## Don't

- Don't write or commit deployment config (Dockerfiles, CI deploy jobs,
  hosting-specific files) speculatively — that's a decision for whoever
  owns infra, not something to infer from the codebase alone.
- Don't assume `.env.example`'s local-dev defaults (SQLite fallback
  mentioned in Laravel's own defaults, file-based sessions/cache in a
  minimal setup) are appropriate for production without confirming.
