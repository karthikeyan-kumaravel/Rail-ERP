# Prettier Rules

## Configuration

`.prettierrc`:

```json
{
    "semi": true,
    "singleQuote": true,
    "singleAttributePerLine": false,
    "htmlWhitespaceSensitivity": "css",
    "printWidth": 80,
    "plugins": ["prettier-plugin-tailwindcss"],
    "tailwindFunctions": ["clsx", "cn", "cva"],
    "tailwindStylesheet": "resources/css/app.css",
    "tabWidth": 4,
    "overrides": [
        { "files": "**/*.yml", "options": { "tabWidth": 2 } }
    ]
}
```

Key points:

- **Semicolons on**, **single quotes**, **80-char print width**,
  **4-space indent** (2 for `.yml`/`.yaml`) — `.editorconfig` mirrors the
  same indent defaults for non-Prettier-covered files.
- **`prettier-plugin-tailwindcss`** auto-sorts Tailwind class lists into a
  canonical order, resolved against `resources/css/app.css` as the
  stylesheet (so it understands this project's custom `--color-*`/
  `--sidebar-*` tokens used in arbitrary-value classes like
  `bg-[var(--color-surface)]`). It also sorts classes passed through
  `clsx(...)`, `cn(...)`, or `cva(...)` calls specifically (the
  `tailwindFunctions` list) — if you introduce a new class-merging helper
  under a different name, it won't be sorted automatically unless added to
  that list.

## What this means day to day

- **Never hand-order a `className` string** — write it in whatever order is
  readable while drafting, then run Prettier and let it resolve the
  canonical order. Don't "fix" a className order Prettier already picked;
  that's fighting the tool.
- Don't fight the 80-char width by manually cramming JSX/TS onto fewer,
  longer lines — let Prettier wrap it.
- Prettier only covers `resources/` (see `package.json`'s
  `format`/`format:check` scripts: `prettier --write/--check resources/`) —
  it does not run over PHP files (that's Pint's job, see `[[pint]]`).

## Running it

```bash
npm run format         # write mode
npm run format:check    # check mode, used by CI (lint.yml)
```

CI's `lint.yml` runs `npm run format` (write mode) directly, not
`format:check`, as a step separate from lint — meaning a PR's CI run can
itself reformat files. Still run `npm run format` locally before pushing so
your diff already reflects the formatted output rather than surprising you
after CI runs.
