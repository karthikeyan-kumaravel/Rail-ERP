# Naming Conventions

## PHP

- Classes: `StudlyCase` (`PurchaseOrderController`, `HasAuditSessionFields`).
- Methods/variables: `camelCase`.
- Database tables/columns: `snake_case`, plural table names
  (`purchase_orders`, `loa_items`).
- Form Requests: always paired, `Store{Model}Request` / `Update{Model}Request`
  — even when validation is nearly identical between the two.
- Traits under `app/Models/Concerns/` and `app/Http/Controllers/Concerns/`
  are named `Has{Capability}` (`HasAuditSessionFields`, `HasMaskedRouteKey`,
  `HasPaginatedIndex`).
- Enum-like PHP constants use `TitleCase`/`UPPER_SNAKE`-free string values,
  e.g. `UserScreen::ICONS` is a flat array of **kebab-case string keys**
  (`'bank-guarantee'`, `'purchase-order'`) — not enum cases, and not
  camelCase; this exact casing is load-bearing since it's mirrored 1:1 in the
  frontend `IconKey` union.
- Route names: `{prefix}.{resource}.{action}` via `->name('admin.')` group
  prefixing + Laravel's resourceful naming (`admin.vendors.index`,
  `admin.loas.pdf`).

## TypeScript / React

- Components: `PascalCase` (`IconPicker`, `AdminLayout`).
- Files: `kebab-case.tsx` (`icon-picker.tsx`, `user-screen-form-fields.tsx`),
  **including** for files that default-export a PascalCase component — the
  file name is not the component name.
- Hooks: `useCamelCase` (`usePreferences`).
- Shared per-resource form component: `{resource}-form-fields.tsx`.
- Icon keys (`IconKey` type in `resources/js/lib/icons.tsx`): **kebab-case
  string literals**, must exactly match `UserScreen::ICONS` on the PHP side
  (see `[[database]]`, `[[ui-guidelines]]`) — e.g. `'gantt-chart'`,
  `'labour-management'`, not `ganttChart` or `GANTT_CHART`.
- CSS custom properties: `--color-*` (base theme), `--sidebar-*` (sidebar-only
  tokens), `--gradient-*` (decorative backdrop only) — see
  `resources/css/app.css`'s own doc-comment header for the full axis list.
- Data attributes driving theme state: `data-theme`, `data-accent`,
  `data-bg-style`, `data-gradient`, `data-font-size`, `data-radius`,
  `data-animations` — all lowercase, hyphenated, set on `<html>`.

## Folder naming (frontend pages)

`resources/js/pages/admin/{folder-name}/` always matches the backend
`folder_name` column / route segment for that resource — e.g. the
`purchase-orders` folder pairs with `Route::resource('purchase-orders', ...)`
and `UserScreen.folder_name = 'purchase-orders'`. When scaffolding a new
resource, pick the kebab-case folder/route name first and reuse it
everywhere (route, page folder, `folder_name` seed value) rather than letting
any of the three drift from the others.
