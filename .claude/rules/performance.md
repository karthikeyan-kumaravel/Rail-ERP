# Performance Rules

## Database

- Eager-load relationships before mapping/serializing a collection —
  column-scoped (`->with(['state:id,name', 'district:id,name'])`), never a
  bare `->with('state')` when only a couple of columns are actually read.
  Never trigger lazy-loaded relationship access inside a `->map()`/
  `->through()` callback over a collection — that's an N+1 by definition.
- Use the shared `HasPaginatedIndex` trait
  (`app/Http/Controllers/Concerns/HasPaginatedIndex.php`) for every list
  endpoint. It already handles the "All" page-size case efficiently (still
  returns a real paginator shape); don't hand-roll a second pagination
  helper.
- Reference/option lists for dropdowns should `->get(['id', 'name', ...])`
  with only the columns actually needed, not `select('*')`.
- Push filtering (`search`, `is_delete`, status) into the query builder —
  never fetch everything and filter in PHP/JS.

## Frontend

- Vite + `laravel-vite-plugin` handles bundling; Inertia pages are
  effectively code-split per route already — don't manually
  `React.lazy()`/dynamic-`import()` a page component, that's already the
  granularity Inertia resolves at.
- Keep `useEffect`s that attach global listeners (`resize`, `scroll`,
  `mousedown`, `keydown`) scoped to only run while actually needed (`open`
  guard) — see the popover pattern in `[[react]]`. An always-on global
  listener across every page is wasted work.
- Memoize expensive derived data with `useMemo` when it depends on
  user-typed input across a large fixed dataset (see `icon-picker.tsx`'s
  `filteredCategories` memo over the ~55-icon catalog) — don't recompute a
  filter/sort of a non-trivial list on every render without it.
- Stabilize callback identity with `useCallback` when it's a dependency of
  an effect that manages subscriptions/listeners, to avoid needless
  teardown/re-attach churn (see `closePanel` in `icon-picker.tsx`).

## Assets

- Tailwind v4's CSS-first config + `@tailwindcss/vite` already produces a
  scoped, purged stylesheet — don't hand-maintain a second CSS file or
  inline `<style>` blocks for anything expressible as utility classes plus
  the existing CSS custom properties in `resources/css/app.css`.
- Icons are tree-shaken from `lucide-react` via named imports
  (`import { Home, ShieldCheck } from 'lucide-react'`) — never
  `import * as Icons from 'lucide-react'`, which would pull the whole set
  into the bundle.

## Excel/PDF (heavier operations)

- Bulk imports (`maatwebsite/excel`) log to `import_logs` for auditability
  and error surfacing — reuse that pattern (`SettingsImportController`,
  `LoaItemImportController`) rather than processing uploads synchronously
  in a way that can't report partial failures.
- PDF generation (`barryvdh/laravel-dompdf`) is done per-request
  (`GET admin/loas/{loa}/pdf`) — if a new export becomes large/slow enough to
  matter, that's a signal to move it to a queued job, not to leave it
  blocking the request cycle silently.
