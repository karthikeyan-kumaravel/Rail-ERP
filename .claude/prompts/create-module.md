# Prompt: Create a New Module

Use this when asked to add a brand-new domain resource end-to-end (e.g. "add
a Contractors module", "add a Tender module") — everything from the
migration up through the sidebar menu entry. This is the full pipeline;
`[[create-crud]]` and `[[create-form]]` cover the backend/frontend halves in
more depth individually.

Read `[[architecture]]`, `[[database]]`, `[[naming-conventions]]` first —
this prompt assumes those conventions.

## 1. Pick names up front

Decide the kebab-case name once and reuse it everywhere: route segment,
`folder_name`, frontend page folder — e.g. `contractors`. Don't let the
route, the DB `folder_name`, and the page folder drift from each other (see
`[[naming-conventions]]`).

## 2. Migration + model

```bash
php artisan make:model Contractor -mf --no-interaction
```

- Migration: standard columns for the resource, **plus** the full legacy
  audit block (`unique_id`, `acc_year`, `session_id`, `sess_user_type`,
  `sess_user_id`, `sess_company_id`, `sess_branch_id`, `created`, `updated`,
  `timestamps()`) and `is_delete` boolean — copy verbatim from a recent
  migration (`[[database]]`).
- Model: `use HasFactory, HasAuditSessionFields, HasMaskedRouteKey;`,
  `#[Fillable([...])]`, full `@property` PHPDoc block, typed relationship
  methods with generics (`BelongsTo<Parent, $this>`) — see `[[laravel]]`,
  `[[phpstan]]`.
- Factory: realistic fake data for every fillable column.

## 3. Requests

```bash
php artisan make:request Admin/StoreContractorRequest --no-interaction
php artisan make:request Admin/UpdateContractorRequest --no-interaction
```

`authorize()` returns `true` (no policy layer yet, `[[permissions]]`).
Validation rules scoped with `Rule::exists(...)->where(fn ($q) =>
$q->where('is_delete', false))` for any FK. Regex-validate structured
identifiers. See `StoreVendorRequest` as the template.

## 4. Controller

```bash
php artisan make:controller Admin/ContractorController --no-interaction
```

Standard shape: `use HasPaginatedIndex;`, `index/create/store/edit/update/destroy`
— see `[[create-crud]]` for the method-by-method template.

## 5. Routes

Add to `routes/web.php` inside the existing `admin.` group:

```php
Route::resource('contractors', ContractorController::class)->except('show');
```

## 6. Frontend pages

```
resources/js/pages/admin/contractors/
  index.tsx
  create.tsx
  edit.tsx
  contractor-form-fields.tsx
```

Use `useForm`, Wayfinder route helpers, the shared `labelClass`/
`inputClass`/`errorClass` constants, `IconPicker` for any icon field,
`table-pagination.tsx` for the index list — see `[[create-form]]`,
`[[ui-guidelines]]`.

## 7. Wire it into the sidebar menu

Add a `UserScreen` row (via the admin UI, a seeder entry, or a factory in a
test) with `folder_name` matching the route segment and an `icon` key from
the existing catalog — or add a new `IconKey` first if nothing fits (see
`[[ui-guidelines]]`: any new key must be mirrored in
`resources/js/lib/icons.tsx` **and** `UserScreen::ICONS`).

## 8. Tests

`tests/Feature/ContractorControllerTest.php` (Pest) covering create,
validation failure, update, soft-delete, and list ordering/filtering — see
`[[testing]]`.

## 9. Gate

Run the full checklist in `[[review-checklist]]` before calling it done —
Pint, PHPStan, ESLint, tsc, Prettier, Pest, and a manual browser pass of the
new pages.
