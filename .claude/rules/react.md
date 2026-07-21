# React Rules

## Framework conventions

- **Functional components + hooks only** — no class components anywhere in
  this codebase.
- **Inertia owns navigation and form state** — use `@inertiajs/react`'s
  `useForm<FormDataType>({...})` for every create/edit form (see
  `resources/js/pages/admin/vendors/create.tsx`), not local `useState` +
  manual `fetch`. Destructure `{ data, setData, post, processing, errors }`
  and pass `data`/`setData`/`errors` straight into the shared
  `{resource}-form-fields.tsx` component.
- **Use Wayfinder-generated route/action helpers**, not hand-written URL
  strings: `import { index, store } from '@/routes/admin/vendors'` /
  `import { update } from '@/actions/...'`. These are generated build
  artifacts (`resources/js/routes/**`, `resources/js/actions/**`) — never
  hand-edit them, and never bypass them with a literal `/admin/vendors`
  string in a component.
- `Link`/`router` from `@inertiajs/react` for navigation and actions
  (`router.post('/logout')` in `admin-layout.tsx` is the one place a literal
  path is used, since it has no resourceful route helper).

## No component library

There is no shadcn/ui, Radix, MUI, or similar in this app — see
`[[ui-guidelines]]` and `[[tech-stack]]`. Every shared UI primitive lives in
`resources/js/lib/*.tsx`, hand-built with Tailwind + CSS custom properties.
When you need a new one (a select, a modal, a combobox), match the existing
pattern (see the popover recipe below) rather than reaching for a new
dependency.

## Popovers / overlays

Follow the exact recipe already used in `appearance-panel.tsx` and
`icon-picker.tsx`:

1. Trigger `<button>` holds a `ref`, sets `aria-haspopup`, `aria-expanded`,
   `aria-controls={panelId}` (from `useId()`).
2. Panel is `createPortal`'d to `document.body`, `position: fixed`,
   coordinates computed from the trigger's `getBoundingClientRect()` in a
   `useEffect` that only attaches listeners while `open`.
3. Close on outside `mousedown` and `Escape` `keydown`; reposition on
   `resize` and `scroll` (capture phase `true`). Always clean up listeners in
   the effect's return function.
4. Wrap any state-resetting close handler in `useCallback` if it's a
   dependency of that effect, so the effect doesn't needlessly tear down and
   re-attach listeners on every unrelated re-render (see `closePanel` in
   `icon-picker.tsx`).

## Hooks discipline

- Never call `setState` synchronously in the body of a `useEffect` purely to
  react to a prop/state change — that's the
  `react-hooks/set-state-in-effect` ESLint rule, and it's enforced
  (`eslint.config.js` uses `reactHooks.configs.flat['recommended-latest']`).
  Reset state at the actual point of the user action instead (see how
  `icon-picker.tsx`'s `closePanel` resets `query` at close-time, not via a
  `useEffect([open])`).
- Respect `react-hooks/exhaustive-deps` — if a dependency is intentionally
  stable (wrapped in `useCallback`/`useMemo`), that's the fix; don't disable
  the rule to silence it.

## Icons

Never import a one-off SVG/icon library component directly into a page for
anything backed by a stored `icon` string key — go through
`resources/js/lib/icons.tsx`'s `DynamicIcon`/`IconChip`/`IconPicker`. See
`[[ui-guidelines]]` for the full contract, and remember any new `IconKey`
must be mirrored in `UserScreen::ICONS` on the PHP side.

## Styling

- Tailwind utility classes only; color/spacing/radius values come from CSS
  custom properties (`bg-[var(--color-surface)]`), never inline hex/rgb.
- Don't hand-order `className` strings — `prettier-plugin-tailwindcss` owns
  sort order (see `[[prettier]]`); run format, don't fight it.

## Type-only imports

`import/consistent-type-specifier-style` is set to `prefer-top-level` —
type-only imports must be a **separate** `import type { X } from '...'`
statement, never an inline `import { type X, y } from '...'`. See
`[[typescript]]`/`[[eslint]]`.
