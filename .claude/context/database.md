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

**Detail/line-item tables are an intentional exception**: `LoaItem`,
`LoaTeamMember`, `LoaStation`, and `PurchaseOrderItem` use only `HasFactory`
— no `HasAuditSessionFields`/`HasMaskedRouteKey`, no `unique_id`/`sess_*`
columns, no masked route key, and (for `PurchaseOrderItem`) no `is_delete`
either. They're always accessed through their parent (`Loa`/`PurchaseOrder`),
never route-bound or listed directly, so the audit/masking overhead is
skipped. Follow this exception only for genuine child/detail rows scoped to
one parent — a table that's ever independently listed, searched, or
route-bound still needs the full trait pair per `[[architecture]]`.

**Composite indexes for the `is_delete` filter**: migration
`2026_07_22_..._add_performance_indexes_to_tables.php` added
`is_delete`-leading composite indexes (e.g. `[is_delete, status]`,
`[is_delete, name]`) to several frequently-listed tables — since every query
already filters `is_delete` first, pair a new frequently-queried column with
`is_delete` in a composite index rather than indexing it alone.

## Table groups (by domain)

**Identity & access**
`users`, `user_types`, `user_screens` (self-referencing `main_screen_id`
tree — see `[[permissions]]`), `user_type_permissions` (per-role, per-screen
`can_view/can_add/can_update/can_delete` overrides — the table that actually
backs enforcement now; see `[[permissions]]`)

**Geography master data**
`states` → `districts` → `cities`, `zones`, `divisions`, `stations`
(hierarchical; each usually FKs to its parent with `restrictOnDelete()`)

**Parties**
`customers`, `vendors`, `banks` (name + `active_status`; referenced by
`loa_financial_securities.bank_id`)

**Tendering / contracts**
`loas` (Letter of Acceptance — the central contract record: contract value,
completion/defect-liability periods, scope of work, security deposit —
**bank guarantee fields were dropped** from this table by migration
`2026_07_21_110001_drop_bank_guarantee_fields_from_loas_table.php`),
`loa_items` (schedule/BOQ line items: quantity, unit rate, escalation, bid
rate/amount), `loa_team_members`, `loa_stations`, `loa_financial_securities`
(replaces the old inline BG fields: `security_type` — EMD / performance BG /
security BG via `LoaFinancialSecurity::TYPES` — amount, validity dates,
claim period, `bank_id`, and an uploaded proof file's path/original name)

**Procurement**
`purchase_orders` — **restructured** by migration
`2026_07_24_100000_restructure_purchase_orders_for_loa_line_items.php`: it's
now a header record (`po_number`, `order_date`, `loa_id`, `vendor_id`,
`delivery_date`, `status` — see `PurchaseOrder::STATUSES` — `payment_type` —
see `PurchaseOrder::PAYMENT_TYPES`) rather than holding item/amount/qty
fields directly. Those moved into the new `purchase_order_items` child table
(`loa_item_id`, ordered/received/balance qty, GST-inclusive/exclusive unit
and total price, vendor quote price + variance, `order_no`) — a
`PurchaseOrder` now `hasMany` `PurchaseOrderItem`, mirroring the
`Loa`/`LoaItem` shape.

**Execution resourcing**
`engineers`, `engineer_types`, `departments`, `units`, `projects`,
`activities`, `schedule_names`, `schedule_types`. Note: the `execution-plan`
admin page (Gantt chart, milestones, pre-start checklist tabs) is currently
**frontend-only**, driven by mock data — there is no backing table/model yet
(see `[[business-overview]]`).

**Alerting**
`alerts` — polymorphic (`alertable_type`/`alertable_id` via `Alert::alertable()`
`MorphTo`), `type`/`severity` string constants (e.g.
`Alert::TYPE_LOA_COMPLETION_APPROACHING`, `SEVERITY_CRITICAL`/`SEVERITY_WARNING`),
`due_date`. Currently only LOA-completion-approaching alerts are raised in
practice, but the shape is generic (any model can be `alertable`).

**Operational support**
`import_logs` (Excel import audit trail), `cache`, `jobs` (framework defaults)

## Migration history is chronological, not squashed

`database/migrations/` is a straight timeline (July 2026 onward at time of
writing) with lots of small `add_x_to_y_table` follow-ups rather than
squashed/rebuilt migrations — read the latest migration touching a table to
know its current shape rather than assuming the `create_*_table` migration is
complete. The `purchase_orders` restructure above is the clearest example:
three follow-up migrations (`restructure_purchase_orders_for_loa_line_items`,
`create_purchase_order_items_table`,
`migrate_purchase_order_item_data_to_detail_table`,
`drop_item_columns_from_purchase_orders_table`) fully changed the table's
shape without touching the original `create_purchase_orders_table`
migration.

## Seeding

`database/seeders/SettingsMenuSeeder.php` seeds the `user_screens` navigation
tree with hardcoded `icon` string keys — these **must** stay in the
`UserScreen::ICONS` allow-list (mirrored exactly in
`resources/js/lib/icons.tsx`'s `IconKey`) or seeded rows will fail validation
the next time they're edited. `DatabaseSeeder` also seeds `UserTypeSeeder`
and one test `User`.
