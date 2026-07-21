# PHPStan / Larastan Rules

## Configuration

`phpstan.neon`:

```neon
includes:
    - vendor/larastan/larastan/extension.neon
    - vendor/nesbot/carbon/extension.neon

parameters:
    paths:
        - app/
        - bootstrap/app.php
        - config/
        - database/
        - routes/

    level: 7
```

- **Larastan** (`larastan/larastan`) — Laravel-aware PHPStan extension that
  understands Eloquent magic (relations, query builder, model attributes).
- **Level 7** — fairly strict: no mixed types passed where a specific type
  is expected, return types must be accurate, etc.
- Analyzed paths: `app/`, `bootstrap/app.php`, `config/`, `database/`,
  `routes/`. `resources/`, `tests/` are **not** analyzed by this config —
  don't assume PHPStan will catch a type issue in a factory/seeder/test.

## Running it

```bash
composer run types:check   # phpstan analyse
```

Also runs automatically as part of `composer run test` and the `tests.yml`
CI workflow (`composer types:check` step).

## Writing PHPStan-clean code

- **Type-hint every method parameter and return type** — Larastan can't
  infer what it isn't told, and level 7 will flag missing/inferred-`mixed`
  types.
- Use **array-shape PHPDoc** for anything returning a structured array
  Larastan can't infer from a native type (`@return array<int,
  array{screen_name: string, folder_name: string, icon: string, children:
  array<int, mixed>}>` — see `UserScreen::navigationTree()`).
- Annotate Eloquent relationship return types with the generic form Larastan
  expects: `BelongsTo<UserType, $this>`, `HasMany<User, $this>` (see every
  model's relationship methods) — not a bare `BelongsTo`/`HasMany`.
- `@property` PHPDoc blocks on every model list every column with its exact
  type (including nullability) — keep this in sync whenever a migration adds/
  changes a column; Larastan (and IDEs) rely on it since these aren't
  actual PHP properties.

## Don't fight it with baselines

There's no `phpstan-baseline.neon` in this repo currently — keep it that
way. If a real finding shows up, fix the actual type issue rather than
introducing a baseline/ignore file to grandfather it in. If you're certain
something is a genuine Larastan false positive (rare, but does happen around
some dynamic Eloquent patterns), use a scoped `@phpstan-ignore-next-line`
with a comment explaining why — never a blanket path exclusion.
