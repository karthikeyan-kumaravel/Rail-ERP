# Architecture

## Overall shape

Classic Laravel MVC, with **Inertia.js** replacing the view layer's Blade
templates for anything past the login page: controllers return
`Inertia::render('admin/x/index', [...props])` instead of JSON, and
`resources/views/app.blade.php` is the single root template Inertia hydrates
into. There is no client-side router — Inertia + Laravel's router together
own navigation.

```
Browser  <-- Inertia (JSON-over-XHR + full-page nav) -->  Laravel Controller
                                                                  |
                                                       Eloquent Model / DB
```

A tiny, separate JSON API exists under `/api` (`routes/api.php`,
`App\Http\Controllers\Api\AuthController`) for `register`/`login`/`logout`,
returning real JSON. It uses the same `web` session guard, not tokens — see
`[[authentication]]` for the overlap this creates with the Inertia login page.

## Shared request-scoped state — `HandleInertiaRequests`

`app/Http/Middleware/HandleInertiaRequests.php` shares four things on every
Inertia response:

- `auth.user` — the current user (or null)
- `navigation` — the full sidebar tree, built fresh per-request from
  `UserScreen::navigationTree()`
- `flash.success` / `flash.error` — one-shot session flash messages
- `name` — app name from config

Frontend pages read these via `usePage().props` (see
`resources/js/layouts/admin-layout.tsx`).

## Dynamic navigation

The sidebar is **not hardcoded** in the frontend. `UserScreen` rows form a
2-level tree (`main_screen_id` self-reference); `UserScreen::navigationTree()`
recursively builds it, filtered to `status = true` and `is_delete = false`,
ordered by `order_no` then `screen_name`. The React layout
(`admin-layout.tsx`) renders that tree recursively via a `NavItem` component,
resolving each `icon` string against the shared icon catalog in
`resources/js/lib/icons.tsx`.

## Legacy-ERP schema conventions

Nearly every domain model carries a set of columns that don't come from
Laravel defaults — added via the `HasAuditSessionFields` trait
(`app/Models/Concerns/HasAuditSessionFields.php`):

- `unique_id` (UUID, generated on create) — the **public identifier**. Combined
  with `HasMaskedRouteKey`, route-model-binding uses an **encrypted, masked**
  token (`App\Support\MaskedIdentifier`, AES via `Crypt::encryptString`) as the
  route key instead of the raw UUID or auto-increment ID — so IDs never leak
  in URLs, and the mask can carry an expiry (`MaskedIdentifier::decode`
  rejects expired tokens).
- `acc_year` — a computed "accounting year" string (e.g. `2026-2027`), derived
  from the current date with an April fiscal-year boundary.
- `session_id`, `sess_user_id`, `sess_user_type`, `sess_company_id`,
  `sess_branch_id` — stamped on every create/update from the current session
  and authenticated user, mirroring a legacy multi-company/multi-branch ERP's
  audit convention (company/branch scoping isn't actually implemented yet;
  the columns exist but aren't filtered on).
- `is_delete` (boolean) — **soft delete is done by hand**, not via Laravel's
  `SoftDeletes` trait. `destroy()` actions typically just
  `->update(['is_delete' => true])`; queries must explicitly
  `->where('is_delete', false)`.

Apply both traits (`HasAuditSessionFields`, `HasMaskedRouteKey`) to any new
domain model to stay consistent — see any model in `app/Models/` as a
template (e.g. `UserScreen.php`, `Vendor.php`).

## Controller pattern

Every admin resource controller (`app/Http/Controllers/Admin/*`) follows the
same shape — see `VendorController` as the canonical example:

- `index()` — search/sort/paginate via the `HasPaginatedIndex` trait
  (`app/Http/Controllers/Concerns/HasPaginatedIndex.php`), which standardizes
  the "Show N entries" page-size dropdown (`10/25/50/100/250/500/All`) across
  every list page.
- `create()` / `edit()` — render the form page with whatever reference option
  lists it needs (states, districts, etc.), hand-picked via `->only([...])`.
- `store()` / `update()` — take a dedicated `Store{X}Request` /
  `Update{X}Request` Form Request for validation, then a plain
  `Model::create()`/`$model->update()`.
- `destroy()` — soft delete (`is_delete = true`), not a real row delete.

## Frontend layout

`resources/js/layouts/admin-layout.tsx` is the one shared authenticated shell
(sidebar + header + content slot) every `resources/js/pages/admin/**` page
wraps itself in. It owns: the collapsible/expandable sidebar nav, the
Appearance preferences popover, and the user menu/logout. Theming is
CSS-variable driven — see `[[ui-guidelines]]`.
