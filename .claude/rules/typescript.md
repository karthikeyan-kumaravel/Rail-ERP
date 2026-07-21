# TypeScript Rules

## Compiler

- `npx tsc --noEmit` (aliased as `npm run types:check`) must pass with zero
  errors before any frontend change is considered done.
- Explicit prop types for every component (`type XProps = {...}`), explicit
  return types are expected on non-trivial functions (see
  `resolvePerPage`-style helpers throughout `resources/js/lib/`).

## Type-only imports

- `@typescript-eslint/consistent-type-imports` is enforced with
  `prefer: 'type-imports'` and `fixStyle: 'separate-type-imports'` — meaning:
  - Use `import type { Foo } from '...'` for anything that's a type-only
    import.
  - When a module needs both a value and a type import, that's **two
    separate import statements**, not `import { type Foo, bar } from '...'`
    (`import/consistent-type-specifier-style: 'prefer-top-level'` enforces
    this on top). See `resources/js/lib/icon-picker.tsx`'s
    `import { ... } from '@/lib/icons'` + `import type { IconKey } from '@/lib/icons'`
    pair for the canonical example.

## `any`

The ESLint rule `@typescript-eslint/no-explicit-any` is explicitly turned
**off** in `eslint.config.js` — so lint won't catch `any`. That's a pragmatic
allowance, not an endorsement: still prefer a real type or `unknown` with a
narrowing check. Reach for `any` only when modeling a genuinely dynamic shape
(e.g. an escape hatch around a third-party type gap), not as a shortcut past
a type error you don't want to solve.

## String literal unions over enums

This codebase prefers string literal unions (`type AccentColor = 'orange' |
'blue' | 'green' | 'purple' | 'red'`, `type IconKey = keyof typeof ICONS`)
over TypeScript `enum` — match this. `IconKey` in particular is
kebab-case-string-keyed and must stay byte-identical to `UserScreen::ICONS`
on the PHP side (see `[[naming-conventions]]`, `[[database]]`).

## Records over ad-hoc lookups

Prefer typed `Record<K, V>` maps (see `ICONS`, `ICON_COLORS` in
`resources/js/lib/icons.tsx`) over `switch` statements or chained
if/else-if when mapping a fixed key set to a value — it keeps the compiler
checking exhaustiveness against the union type.

## File/module conventions

- One default export per file for components; named exports for
  types/constants/helpers colocated in the same file when they're only used
  alongside that component (see `icons.tsx` exporting `ICONS`, `IconKey`,
  `ICON_COLORS`, `IconChip`, `DynamicIcon`, `getIconColor`,
  `getIconLabel` all from one file, since they're one cohesive unit).
- Shared types that cross multiple pages live in `resources/js/types/`
  (`navigation.ts`, `index.ts`, `global.d.ts`) — don't redefine a shared
  shape locally in a page component.

## Don't fight generated types

`resources/js/actions/**` and `resources/js/routes/**` are Wayfinder-generated
— never hand-edit them or add manual type assertions to work around their
shape; regenerate via the Wayfinder Vite plugin instead (rebuild) if a route
signature looks wrong.
