# Prompt: Create a Dashboard

## Check what already exists

`resources/js/pages/dashboard.tsx` (route: `GET /dashboard`, named
`dashboard`) is the one dashboard page today — it's currently minimal
("Welcome, {name}"). Extend it in place unless asked for a genuinely
separate dashboard page/route.

## No charting library is installed

There is currently no chart/graph library (no Chart.js, Recharts, D3,
visx, etc.) in `package.json` — see `[[tech-stack]]`. If the dashboard needs
actual charts/graphs:

1. **Flag it as a new dependency decision first** — don't silently add one
   (`[[coding-standards]]`: no new dependencies without approval). Ask which
   library, the same way the icon-library choice was resolved for
   `resources/js/lib/icons.tsx`.
2. If it only needs stat tiles, sparklines, or simple bars/progress
   indicators (no real charting), those can be hand-built with plain
   Tailwind + SVG/CSS the same way the rest of the UI is — no library
   needed. Prefer this for simple cases.

## Data

- Aggregate/count queries belong in the `DashboardController` (create one if
  it doesn't exist yet: `php artisan make:controller DashboardController`)
  — don't compute aggregates in the React component from a full unfiltered
  row dump.
- Every count/sum query must respect `is_delete = false` (and `active_status`/
  `status` where relevant) the same as any list query — see `[[database]]`.
- Keep the dashboard's queries cheap: `count()`/`sum()` at the DB level, not
  `->get()->count()`.

## Layout

- Wrap in `AdminLayout` like every other admin page.
- Stat tiles / summary cards should follow the existing card style used
  elsewhere (`rounded-xl border border-[var(--color-border)]
  bg-[var(--color-surface)]` — see `AppearancePreview` in
  `appearance-panel.tsx` for the card treatment already established) rather
  than inventing new card chrome.
- Respect the theme system — colors from CSS custom properties, not
  hardcoded hex, so tiles look right across every accent/light/dark
  combination (`[[ui-guidelines]]`).

## Don't

- Don't add a charting dependency without approval.
- Don't duplicate `dashboard.tsx` into a second "new" dashboard file instead
  of extending the existing one, unless a genuinely separate page was
  requested.
- Don't compute business aggregates client-side from an unbounded dataset
  fetched over the wire.
