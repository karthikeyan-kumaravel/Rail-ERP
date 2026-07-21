# Laravel Rules

Repo-specific rules on top of the Laravel Boost guidelines already checked
into `CLAUDE.md` (read those first — this file doesn't repeat them, it adds
what's specific to how *this* app extends vanilla Laravel).

## New models

Every new domain model should:

1. Use `HasFactory`, `HasAuditSessionFields`, `HasMaskedRouteKey` (see
   `app/Models/Concerns/`) — copy the `use` statement pattern from an
   existing model like `UserScreen.php` or `Vendor.php`, not from scratch.
2. Define `#[Fillable([...])]` and, if it has sensitive fields,
   `#[Hidden([...])]` as PHP attributes (see `User.php`) — not the classic
   `protected $fillable = [...]` property.
3. Add `is_delete` (boolean, default `false`) to its migration — **not**
   Laravel's `SoftDeletes` trait. Every query must explicitly filter
   `->where('is_delete', false)`.
4. Add the full legacy audit column set to its migration: `unique_id`
   (`uuid`, nullable, unique), `acc_year`, `session_id`, `sess_user_type`,
   `sess_user_id`, `sess_company_id`, `sess_branch_id`, plus both
   `created`/`updated` (`useCurrent()`/`useCurrentOnUpdate()`) *and*
   Laravel's own `timestamps()`. Copy the block verbatim from a recent
   migration (e.g. `2026_07_08_100000_create_loas_table.php`) rather than
   retyping it.
5. Get a factory (`database/factories/`) — required by `HasFactory`.

See `[[database]]` for the full column reference and `[[architecture]]` for
why these conventions exist.

## Controllers

Follow the standard shape (see `VendorController` as the canonical
reference, described in `[[architecture]]`):

- `use HasPaginatedIndex;` for any `index()` with search/sort/pagination.
- `index()`/`create()`/`edit()` return `Inertia::render(...)`; `store()`/
  `update()`/`destroy()` return `redirect()->route(...)->with('success', ...)`.
- `store()`/`update()` type-hint a dedicated `Store{X}Request`/
  `Update{X}Request`, never inline `$request->validate()`.
- `destroy()` is a soft delete: `$model->update(['is_delete' => true]);` —
  never `$model->delete()` on a domain resource.
- Route-list resources with `Route::resource(...)->except('show')` unless the
  resource genuinely needs a detail view (LOA is the one current exception).

## Requests

- One `Store{X}Request` + one `Update{X}Request` per resource, even when the
  rules barely differ.
- `authorize()` currently returns `true` everywhere (no policy layer yet —
  see `[[permissions]]`); don't add ad-hoc authorization logic inline unless
  asked to actually build the permission system.
- Use `prepareForValidation()` for normalization (uppercasing codes, etc.),
  not controller-side mutation before validation.
- Scope `Rule::exists(...)` with a closure when the check needs to respect
  `is_delete` or a parent relationship (see `StoreVendorRequest`'s
  `district_id` rule checking it belongs to the selected `state_id`).

## Routes

- Everything lives in `routes/web.php` under the `auth` middleware group,
  `Route::prefix('admin')->name('admin.')`. Don't create new top-level route
  files for admin features.
- Custom non-resourceful routes for a resource go directly above that
  resource's `Route::resource(...)` call, not in a separate section.
- Import bulk-load endpoints follow the fixed
  `template`/`preview`/`store`/`logs/{id}/errors` shape under
  `admin.imports.*` — replicate it rather than inventing new verbs.

## Artisan

- Scaffold with `php artisan make:*` (`--no-interaction` when scripted), then
  edit the generated file to match house conventions above — don't
  hand-write boilerplate files from nothing.

## Before finishing any PHP change

Run, in order: `vendor/bin/pint --dirty --format agent`, then
`composer run types:check` (Larastan), then the narrowest relevant Pest
filter. See `[[pint]]`, `[[phpstan]]`, `[[testing]]`.
