# Testing Rules

## Framework

- **Pest**, not raw PHPUnit syntax — `tests/Pest.php` globally binds every
  test in `Feature/` to `Tests\TestCase` with `RefreshDatabase` already
  applied (`pest()->extend(TestCase::class)->use(RefreshDatabase::class)->in('Feature')`),
  so individual test files don't need to declare it.
- Create new tests with `php artisan make:test --pest {Name}` — the `{name}`
  argument is just the class name, no `Feature/` prefix (Pest infers the
  directory).
- Tests run against **SQLite in-memory** (`phpunit.xml`), so they're cheap
  to run repeatedly and fully isolated — no shared state to worry about
  between runs or between test methods.

## Coverage expectations

- Every behavioral change needs a new or updated test proving it. Don't
  ship a bug fix or feature without one.
- One `{Resource}ControllerTest.php` per admin resource under
  `tests/Feature/`, covering the standard CRUD shape (create, validation
  failures, update, soft-delete, and anything resource-specific like
  `UserScreenControllerTest`'s navigation-tree ordering and icon-validation
  cases).
- Run the **narrowest** filter that proves your change, not the whole suite,
  during iteration: `php artisan test --compact --filter=SomeTest`. Run the
  full suite (`composer run test`, which also runs lint/types checks first)
  before considering a larger change complete.

## Don't delete tests without approval

Even a test that looks redundant or is currently failing might be
intentional or pre-existing — confirm before removing. If you discover a
pre-existing failing test unrelated to your change (this repo currently has
a few in `UserScreenControllerTest` around `order_no` uniqueness and
navigation-tree ordering), don't "fix" it as a drive-by — call it out
separately so it can be triaged on its own.

## Factories

Every model has a factory under `database/factories/` (`HasFactory` trait is
required by the audit-fields trait). Use factories for test data, not
manual `Model::create([...])` with hand-typed fields, so tests stay resilient
to schema changes and pick up any factory-defined default states.

## Frontend

There is no JS/TS test runner configured in this repo (no Jest/Vitest/RTL) —
frontend correctness is currently verified by:

1. `npx tsc --noEmit` (type correctness)
2. `npx eslint .` (lint correctness, including React Hooks rules)
3. Manually driving the running app (dev server + browser, or a headless
   Playwright pass) for anything with real interaction/visual behavior —
   see `[[review-checklist]]`. Don't claim a UI change "works" from
   type-check and lint alone.

## CI

Two GitHub Actions workflows run on push/PR to `develop`/`main`/`master`/
`workos`:

- `lint.yml` — Pint, `npm run format`, `npm run lint`.
- `tests.yml` — matrix across PHP 8.3/8.4/8.5, builds assets, runs
  `composer types:check` then `php artisan test`.

Anything that would fail either workflow should be caught locally first —
run `composer run ci:check` (or the individual pieces in `[[linting]]`)
before pushing.
