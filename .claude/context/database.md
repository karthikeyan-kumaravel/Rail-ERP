# Database

## Connection

- **Default**: MySQL (`DB_CONNECTION=mysql`, configured via `.env`;
  `DB_DATABASE=rail_erplocal`).
- **Tests**: SQLite in-memory (`phpunit.xml` overrides `DB_CONNECTION=sqlite`,
  `DB_DATABASE=:memory:`) — fully isolated, no shared state between test runs.

## Universal per-table conventions

Almost every domain table (see `[[architecture]]` for the trait that applies
this) carries the same non-standard column set, inherited from a legacy ERP
schema design:

| Column | Type | Purpose |
|---|---|---|
| `unique_id` | `uuid`, nullable, unique | Public identifier; route-model-binding uses an **encrypted mask** of this, not the raw value (see `HasMaskedRouteKey` / `MaskedIdentifier`) |
| `acc_year` | string, nullable | Computed fiscal year string (`"2026-2027"`), April-boundary |
| `session_id` | string, nullable | PHP session ID at time of write |
| `sess_user_id` | unsigned bigint, nullable | Authenticated user ID at time of write |
| `sess_user_type` | unsigned bigint, nullable | The user's `user_type_id` at time of write |
| `sess_company_id` / `sess_branch_id` | unsigned bigint, nullable | Reserved for future multi-company/branch scoping — **not currently used/filtered on anywhere** |
| `is_delete` | boolean, default false | Soft delete flag. **Not** Laravel's `SoftDeletes` — every query against these tables must explicitly `->where('is_delete', false)` |
| `created` / `updated` | timestamp, `useCurrent()` / `useCurrentOnUpdate()` | Legacy-style duplicate of `created_at`/`updated_at` (both pairs exist on most tables) |

Most tables also have an `active_status` / `status` boolean separate from
`is_delete` — `is_delete` means "gone", `active_status`/`status` means
"enabled but still present" (e.g. a screen can be inactive without being
deleted).

## Table groups (by domain)

**Identity & access**
`users`, `user_types`, `user_screens` (self-referencing `main_screen_id` tree
— see `[[permissions]]`)

**Geography master data**
`states` → `districts` → `cities`, `zones`, `divisions`, `stations`
(hierarchical; each usually FKs to its parent with `restrictOnDelete()`)

**Parties**
`customers`, `vendors`

**Tendering / contracts**
`loas` (Letter of Acceptance — the central contract record: contract value,
completion/defect-liability periods, BG amount/validity, security deposit,
scope of work), `loa_items` (schedule/BOQ line items:
quantity, unit rate, escalation, bid rate/amount), `loa_team_members`,
`loa_stations`

**Procurement**
`purchase_orders` (supplier, items description, amount, delivery date,
payment terms, qty ordered/received, inspection/dispatch status)

**Execution resourcing**
`engineers`, `engineer_types`, `departments`, `units`, `projects`,
`activities`, `schedule_names`, `schedule_types`

**Operational support**
`import_logs` (Excel import audit trail), `cache`, `jobs` (framework defaults)

## Migration history is chronological, not squashed

`database/migrations/` is a straight timeline (July 2026 onward at time of
writing) with lots of small `add_x_to_y_table` follow-ups rather than
squashed/rebuilt migrations — read the latest migration touching a table to
know its current shape rather than assuming the `create_*_table` migration is
complete.

## Seeding

`database/seeders/SettingsMenuSeeder.php` seeds the `user_screens` navigation
tree with hardcoded `icon` string keys — these **must** stay in the
`UserScreen::ICONS` allow-list (mirrored exactly in
`resources/js/lib/icons.tsx`'s `IconKey`) or seeded rows will fail validation
the next time they're edited. `DatabaseSeeder` also seeds `UserTypeSeeder`
and one test `User`.
