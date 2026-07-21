# Linting Overview

This project runs four distinct static-quality tools. This file is the map;
see the dedicated file for each tool's specifics: `[[pint]]` (PHP
formatting), `[[phpstan]]` (PHP static analysis), `[[eslint]]` (JS/TS lint),
`[[prettier]]` (JS/TS/CSS formatting). `[[sonar]]` covers code-quality
concerns not currently automated by any of the above.

## The full local gate

```bash
composer run ci:check
```

runs, in order: `npm run lint:check`, `npm run format:check`,
`npm run types:check`, then the full Pest suite (via `composer run test`,
which itself runs `config:clear`, `lint:check` (Pint `--test`),
`types:check` (PHPStan), then `php artisan test`). This is the same gate CI
enforces — run it (or the relevant subset for your change) before
considering work finished, not just the individual tool you think is
relevant.

## Which tool to run for which change

| Change touches | Run |
|---|---|
| Any `.php` file | `vendor/bin/pint --dirty --format agent`, then `composer run types:check` |
| Any `.ts`/`.tsx` file | `npx eslint <file>`, `npx tsc --noEmit` |
| Any Blade/CSS/JSON/YAML | `npm run format:check` (Prettier covers these too) |
| Anything | the relevant Pest filter (`[[testing]]`) |

## Don't mix formatting and functional changes

Since Pint/Prettier/ESLint's `--fix` can rewrite large swaths of a file,
run formatters on their own commit/step when possible, and don't let
auto-fixes silently absorb into a diff that's supposed to be reviewed for
logic — see `[[git]]` on keeping diffs scoped.

## Never suppress instead of fixing

Don't add `@phpstan-ignore`, `// eslint-disable`, or a Pint exclusion to
silence a finding unless the finding is a confirmed false positive — and if
so, note *why* right next to the suppression (a suppression with no
justification is worse than the original warning).
