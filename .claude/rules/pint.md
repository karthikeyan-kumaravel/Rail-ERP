# Laravel Pint Rules

## Configuration

`pint.json`:

```json
{
    "preset": "laravel"
}
```

Just the stock `laravel` preset — no custom rule overrides. That preset
covers PSR-12 plus Laravel-flavored conventions (import ordering, blank
lines, short array syntax, etc.).

## Running it

- **Always** run `vendor/bin/pint --dirty --format agent` after editing any
  PHP file, before considering the change done — this only formats files
  that differ from the last commit, so it's fast and scoped.
- **Never** run `vendor/bin/pint --test` and then hand-fix the diff — just
  run plain `pint` (or `--dirty`) and let it fix formatting directly; `--test`
  is for CI to *check* formatting is already clean, not for local use.
- `composer run lint` runs `pint --parallel` (whole codebase); CI's
  `lint.yml` runs the same via `composer lint`. Local iteration should stick
  to `--dirty` for speed.

## What this means day to day

- Don't hand-format PHP (manually aligning `=>`, spacing braces, etc.) —
  write it reasonably, then run Pint and let it normalize. Don't fight Pint's
  output by re-editing what it just formatted.
- If Pint and a hand-written style choice disagree, Pint wins — there is no
  project-specific override to appeal to.
