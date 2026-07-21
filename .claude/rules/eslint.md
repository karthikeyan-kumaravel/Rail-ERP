# ESLint Rules

## Configuration

Flat config (`eslint.config.js`, ESLint 9). Composed from:

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-react-hooks` `recommended-latest` (flat)
- `eslint-plugin-react` recommended + `jsx-runtime` (no `import React` needed)
- `eslint-plugin-import` with the TypeScript resolver
- `@stylistic/eslint-plugin` for brace style + blank-line rules
- `eslint-config-prettier` applied last, to disable any rule that would
  conflict with Prettier's own formatting

## Rules worth knowing explicitly (they're easy to violate without realizing)

- **`curly: ['error', 'all']`** — every `if`/`for`/`while`/etc. needs braces,
  even single-statement bodies. No exceptions.
- **`@stylistic/brace-style: ['error', '1tbs', { allowSingleLine: false }]`**
  — one-true-brace-style, and single-line blocks are *not* allowed even if
  they'd fit on one line.
- **`@stylistic/padding-line-between-statements`** — a blank line is
  **required** immediately before and after every `if`, `return`, `for`,
  `while`, `do`, `switch`, `try`, `throw` statement. This is unusual and
  easy to miss — don't write dense code with a `return` or `if` butted
  right up against the previous line.
- **`import/order`** — imports must be grouped
  (`builtin`/`external`/`internal`/`parent`/`sibling`/`index`) and
  alphabetized (case-insensitive) within each group. Let `eslint --fix`
  (or `npm run lint`) reorder them rather than hand-ordering.
- **`@typescript-eslint/consistent-type-imports`** (`prefer: 'type-imports'`,
  `fixStyle: 'separate-type-imports'`) + **`import/consistent-type-specifier-style: 'prefer-top-level'`**
  — together these mean: type-only imports must be their own
  `import type { X } from '...'` statement, never `import { type X }` inline
  alongside value imports. See `[[typescript]]`.
- **`@typescript-eslint/no-explicit-any: 'off'`** — `any` is not flagged by
  lint here; don't assume ESLint is your guardrail against it (see
  `[[typescript]]` for why to still avoid it).
- **`react/react-in-jsx-scope: 'off'`**, **`react/prop-types: 'off'`**,
  **`react/no-unescaped-entities: 'off'`** — deliberately disabled; don't
  "fix" code to satisfy these if you see them mentioned elsewhere, they're
  intentionally off for this React 19 / TypeScript-typed codebase.
- **`react-hooks` recommended-latest** — includes `set-state-in-effect` and
  `exhaustive-deps` among others; see `[[react]]` for the concrete pattern
  fixes (reset-on-close instead of effect-on-close, `useCallback` for
  stable effect deps).

## Ignored paths

`vendor`, `node_modules`, `public`, `bootstrap/ssr`, `tailwind.config.js`,
`vite.config.ts`, `resources/js/actions/**`,
`resources/js/components/ui/*`, `resources/js/routes/**`,
`resources/js/wayfinder/**` — all generated/vendored, never lint or hand-edit
these.

## Running it

```bash
npx eslint <file>     # single file, fast iteration
npm run lint:check      # whole project, no fixes (CI uses this)
npm run lint             # whole project, --fix
```

Fix real findings; don't add inline `// eslint-disable` comments unless the
finding is a confirmed false positive, and note why if you do.
