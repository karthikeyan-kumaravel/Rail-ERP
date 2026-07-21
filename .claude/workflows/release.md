# Workflow: Release

## Current state: no formal release process defined

There is no `CHANGELOG.md`, no version-tagging convention, and no release
GitHub Action in this repo — only `lint.yml` and `tests.yml` (CI
verification, not release automation). Don't assume a release pipeline
exists; the steps below are proposed baseline practice grounded in what the
repo *does* already define (the `composer run setup` script, the CI-watched
branches), not a description of an existing automated release.

## Branches

`lint.yml`/`tests.yml` run on push/PR to `develop`, `main`, `master`, and
`workos` (see `[[git]]`). Treat `main` (or whichever of these is actually
the production-tracking branch in use — confirm before assuming) as the
release branch; merges into it should already be green on both workflows.

## Before cutting a release

1. **Everything merging in has passed CI** — Pint, `npm run format`/`lint`
   (`lint.yml`), and the full Pest suite across the PHP 8.3/8.4/8.5 matrix
   plus `composer types:check` (`tests.yml`). Don't release on top of a red
   build.
2. **Run the full local gate once more** on the release branch:
   `composer run ci:check` (lint:check + format:check + types:check + test).
3. **Check for pending migrations** that haven't been run against whatever
   environment is being released to — `php artisan migrate --force` is
   what `composer run setup` uses for a fresh install; a release to an
   existing environment needs the same migrate step, not a fresh install.
4. **Rebuild frontend assets** — `npm run build` (production Vite build);
   don't ship with a dev-server-only build.

## What's genuinely missing if a real pipeline is wanted

If asked to actually set up releases (not just described in a document),
that's separate scoped work, likely involving:

- A tagging/versioning convention (this repo has none currently).
- A CD workflow (`.github/workflows/deploy.yml` or similar) — doesn't exist;
  see `[[deployment]]` for the same caveat on the deploy side.
- Deciding on a target platform — the Laravel Boost guidelines checked into
  `CLAUDE.md` mention Laravel Cloud as the recommended default; no
  infrastructure-as-code or hosting config exists in this repo to confirm
  that's actually where this app runs.

Flag this gap rather than inventing release tooling unprompted — confirm
the target process/platform with whoever owns deployment before building
automation around an assumption.
