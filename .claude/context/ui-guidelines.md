# UI Guidelines

## Design system: CSS custom properties, not a component library

There is no shadcn/ui, Radix, Heroicons, or Tabler in this app. Every visual
primitive (sidebar, form fields, popovers, tables, toasts) is hand-built in
`resources/js/lib/*.tsx` and themed entirely through CSS custom properties
defined in `resources/css/app.css`. **Never hardcode a hex color in a
className** — reference or extend a `--color-*` / `--sidebar-*` variable.

## Theming axes (each independent, toggled via `data-*` attributes on `<html>`)

| Attribute | Values | Controls |
|---|---|---|
| `data-theme` | `light` \| `dark` | Base neutrals (bg/surface/ink/borders) |
| `data-accent` | `orange` \| `blue` \| `green` \| `purple` \| `red` | Buttons, links, active states, sidebar tint |
| `data-bg-style` | `solid` \| `gradient` \| `glass` | Page backdrop + surface glassmorphism |
| `data-gradient` | `orange`/`blue`/`green`/`purple`/`red`/`sunset`/`ocean`/`forest`/`midnight`/`custom` | Decorative page-backdrop gradient only |
| `data-font-size` | `small` \| `medium` \| `large` | Scales Tailwind's `--text-*` scale globally |
| `data-radius` | `small` \| `medium` \| `large` | Scales Tailwind's `--radius-*` scale globally |
| `data-animations` | `on` \| `off` | Kills all transition/animation durations when off |

All of this is set by `applyPreferences()` in
`resources/js/lib/use-preferences.tsx`, driven by the `AppearancePanel`
component (`resources/js/lib/appearance-panel.tsx`), and **persisted to
`localStorage`** under `rail-erp-preferences` — there is no server-side
persistence of appearance preferences.

## The sidebar is deliberately always-dark

Regardless of `data-theme` (light/dark app mode), the sidebar
(`resources/js/layouts/admin-layout.tsx`) renders as a dark, accent-tinted
gradient panel — a common admin-dashboard pattern. Its tokens
(`--sidebar-bg-from/to`, `--sidebar-border`, `--sidebar-ink(-soft)`,
`--sidebar-hover-bg`, `--sidebar-active-bg/border`) are derived via
`color-mix()` from the same raw `--color-accent(-base)`/`--color-accent-2-base`
hues the rest of the app uses, so it re-tints automatically per accent
without per-accent duplication — see `resources/css/app.css`.

## Icons

`resources/js/lib/icons.tsx` is the single source of truth for icons used via
a string key (as opposed to one-off decorative SVGs imported directly):

- `ICONS: Record<IconKey, LucideIcon>` — the full catalog (55 keys at time of
  writing), backed by `lucide-react`.
- `ICON_COLORS: Record<IconKey, string>` — one fixed hex color per icon key,
  used for colorful "chip" rendering (independent of the accent color).
- `ICON_CATEGORIES` — groups keys for the searchable picker UI only; purely
  cosmetic, no bearing on validation.
- `IconChip` — renders an icon in its colored, rounded chip; use this
  wherever a colorful icon representation is wanted (sidebar nav, list rows,
  the icon picker).
- `DynamicIcon` — renders a bare icon by key string, falls back to a grid
  icon for unrecognized keys.
- **Any new `IconKey` must be mirrored exactly in `UserScreen::ICONS`**
  (`app/Models/UserScreen.php`) — that's the server-side `Rule::in()`
  allow-list. Keep the two lists in sync manually; nothing generates one from
  the other.
- `IconPicker` (`resources/js/lib/icon-picker.tsx`) is the searchable
  combobox for choosing an icon by key — use it instead of a native
  `<select>` anywhere an `IconKey` needs picking.

## Popover/overlay pattern

Both `AppearancePanel` and `IconPicker` follow the same recipe — reuse it
rather than introducing a new overlay approach:

1. A trigger `<button>` with a `ref`, `aria-haspopup`, `aria-expanded`,
   `aria-controls`.
2. The panel is `createPortal`'d to `document.body`, positioned with
   `position: fixed` computed from the trigger's `getBoundingClientRect()`.
3. Close on outside `mousedown`, `Escape` keydown, and reposition on
   `resize`/`scroll` (capture phase) — all via `useEffect` cleanup, guarded so
   listeners are only attached while `open`.

## Forms

Every `{resource}-form-fields.tsx` component shares the same class constants
convention (see `user-screen-form-fields.tsx`, `vendor-form-fields.tsx`):

```ts
const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass = 'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';
```

Reuse these constants (or copy the pattern) rather than inventing new input
styling per resource.

## List pages

Pagination/search/sort controls are standardized via the backend
`HasPaginatedIndex` trait and the frontend `table-pagination.tsx`
component — page sizes are always `10/25/50/100/250/500/All`.
