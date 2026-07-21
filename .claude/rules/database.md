# Database Rules

See `[[database]]` (context) for the full schema reference this file assumes.

## Soft delete discipline

`is_delete` is a plain boolean column, not Laravel's `SoftDeletes` trait.
Consequences:

- **Every** query against a domain table must explicitly
  `->where('is_delete', false)` — there is no global scope doing this for
  you. Forgetting it is the single easiest way to leak "deleted" records
  back into a list or a dropdown.
- `destroy()` controller actions must `->update(['is_delete' => true])`,
  never call `->delete()` on a domain model.
- `active_status`/`status` is a **separate** concept from `is_delete` —
  check both where a query needs to mean "visible and enabled" (e.g.
  `UserScreen::navigationTree()` filters on both `status` and `is_delete`).

## New tables

Every new domain-model migration needs the full legacy audit column block —
copy it from a recent migration rather than retyping:

```php
$table->uuid('unique_id')->nullable()->unique();
$table->string('acc_year')->nullable();
$table->string('session_id')->nullable();
$table->unsignedBigInteger('sess_user_type')->nullable();
$table->unsignedBigInteger('sess_user_id')->nullable();
$table->unsignedBigInteger('sess_company_id')->nullable();
$table->unsignedBigInteger('sess_branch_id')->nullable();
$table->timestamp('created')->useCurrent();
$table->timestamp('updated')->useCurrent()->useCurrentOnUpdate();
$table->timestamps();
```

Pair it with `is_delete` (boolean, default `false`) and, on the model side,
the `HasAuditSessionFields` + `HasMaskedRouteKey` traits — see `[[laravel]]`.

## Migrations are additive, never rewritten

`database/migrations/` is a chronological history — once a migration has
shipped, **add a new migration** to alter that table (`add_x_to_y_table`,
`make_x_nullable_on_y_table`, etc.) rather than editing the original
`create_*_table` migration. This repo already has many such follow-ups (see
`2026_07_11_073649_make_location_fields_nullable_on_stations_table.php` as an
example) — match that pattern.

## Query performance

- Eager-load relationships you'll actually read (`->with(['state:id,name',
  'district:id,name'])`, column-scoped) instead of letting N+1 lazy-loads
  happen in a `->through()`/Blade/React mapping step — see
  `VendorController::index()`.
- Select only the columns a reference/options list actually needs
  (`->get(['id', 'name'])`), not `select('*')`, when populating a dropdown.
- Use the shared `HasPaginatedIndex` trait for any list endpoint rather than
  a bare `->get()` — see `[[performance]]`.

## Foreign keys & validation

- FK columns use `Rule::exists('table', 'column')->where(...)` scoped to
  `is_delete = false` (and any relevant parent-child relationship, e.g.
  district validated against the selected state) — see
  `StoreVendorRequest`. Don't rely on the DB foreign key constraint alone to
  surface a friendly validation error.
- Migrations use `->constrained(...)->restrictOnDelete()` for parent
  reference FKs (e.g. `division_id` on `loas`) and `->cascadeOnDelete()` for
  true child/detail rows (e.g. `loa_id` on `loa_items`) — pick based on
  whether the child record is meaningless without its parent.

## Test database

Tests run against **SQLite in-memory** (`phpunit.xml`), fully isolated per
run via Pest's global `RefreshDatabase` (`tests/Pest.php`). Don't write
migrations or queries that rely on MySQL-only syntax/functions if they're
expected to be covered by feature tests.
