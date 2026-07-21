# Coding Standards

This project uses **Laravel Boost** guidelines (checked into `CLAUDE.md`) as
the authoritative style guide. Highlights, plus patterns observed directly in
the codebase:

## PHP

- Always use curly braces for control structures, even one-liners.
- PHP 8 constructor property promotion where applicable; no empty
  zero-param `__construct()`.
- **Explicit return types and param type hints on every method.**
- TitleCase enum keys (`FavoritePerson`, not `favoritePerson`).
- Prefer PHPDoc blocks over inline comments; only comment exceptionally
  non-obvious logic (see `HasAuditSessionFields::bootHasAuditSessionFields()`
  for an example of a comment that earns its keep — it explains a genuine
  Eloquent accessor gotcha, not what the code obviously does).
- Use **array shape PHPDoc** for structured array returns, e.g.:
  ```php
  /**
   * @return array<int, array{screen_name: string, folder_name: string, icon: string, children: array<int, mixed>}>
   */
  ```
- Format with `vendor/bin/pint --dirty --format agent` before finishing any
  PHP change — never hand-format.
- Static analysis: `composer run types:check` (PHPStan/Larastan level per
  `phpstan.neon`). Fix real issues; don't suppress with baseline entries
  unless the finding is a known false positive.

## Testing

- **Pest**, not raw PHPUnit syntax. `php artisan make:test --pest {Name}`
  (name only, no `Feature/` prefix — Pest infers the directory).
- Every change should be covered by a new or updated test; run the narrowest
  filter that proves it: `php artisan test --compact --filter=SomeTest`.
- Don't delete tests without approval.
- Feature tests run against **SQLite in-memory** (`phpunit.xml`), so they're
  fast and fully isolated — no need to reset a real DB between runs.

## Laravel conventions

- Use `php artisan make:*` for new files (migrations, controllers, models,
  requests, factories) — don't hand-roll boilerplate.
- Pass `--no-interaction` to Artisan commands run non-interactively.
- New models get a factory (and usually a seeder) alongside them.
- Route generation: prefer named routes + Laravel Wayfinder's generated
  TS helpers (`@/actions/...`, `@/routes/...`) over hand-written URL strings
  in the frontend.

## TypeScript / React

- **No component library** — match the hand-built style already in
  `resources/js/lib/*.tsx` rather than introducing shadcn/Radix/etc. wholesale.
- Functional components, hooks only (no class components).
- Popovers/overlays follow the `createPortal` + manual
  outside-click/Escape-close pattern established in
  `appearance-panel.tsx`/`icon-picker.tsx` — reuse that shape rather than
  pulling in a new dependency for the next one.
- Styling is Tailwind utility classes driven by **CSS custom properties**
  (`bg-[var(--color-surface)]`, etc.) — never hardcode hex colors in
  component classNames; add/extend a variable in `resources/css/app.css`
  instead (see `[[ui-guidelines]]`).
- Type-check (`npx tsc --noEmit`) and lint (`npx eslint .`) before calling
  frontend work done; fix `react-hooks/set-state-in-effect` and
  `import/consistent-type-specifier-style` findings rather than suppressing.
- Format with Prettier (`prettier-plugin-tailwindcss` auto-sorts class lists —
  don't hand-order className strings against it).

## General

- Don't add dependencies (PHP or npm) without approval — this app currently
  has an intentionally small, curated dependency set.
- Don't create documentation files unless explicitly requested.
- Match sibling files' structure before inventing a new pattern for a new
  resource — this codebase is very consistent resource-to-resource
  (controller shape, request shape, page shape); deviating without reason
  makes the next resource harder to scaffold by copy-paste.
