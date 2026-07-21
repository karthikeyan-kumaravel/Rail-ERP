# Project: Rail ERP (rail_erplocal)

## What this is

A Laravel + Inertia (React) ERP application for managing railway infrastructure
project lifecycles: tendering, Letters of Acceptance (LOA), purchase orders,
site execution, engineering resources, and the master data (states, districts,
divisions, stations, vendors, customers) that everything else hangs off.

The codebase is a single Laravel app serving a React SPA-like frontend via
Inertia — there is no separate frontend build/deploy, and (mostly) no separate
public JSON API; pages are rendered server-side per request and hydrated
client-side.

## Current state

Active work-in-progress. Much of the domain (LOAs, purchase orders, engineers,
projects, vendors, master geography data) is scaffolded with full CRUD, but:

- Permission enforcement (`UserScreen.can_*` flags) is modeled in the schema
  and admin UI but **not yet enforced** anywhere in controllers/middleware.
- There's a duplicated auth surface: a session-based Inertia login flow
  (`AuthenticatedSessionController`) and a separate JSON `Api\AuthController`
  under `/api` — these overlap and haven't been reconciled.
- Test suite has a handful of known-failing, pre-existing tests around
  `UserScreen` order-number uniqueness and navigation-tree ordering, unrelated
  to icon/UI work done so far.

## Where to look first

- `routes/web.php` — the full route map; almost everything lives under
  `admin.*` behind the `auth` middleware group.
- `app/Models/UserScreen.php` — drives the dynamic sidebar navigation tree.
- `resources/js/layouts/admin-layout.tsx` — the shared authenticated shell
  (sidebar + header) every admin page renders inside.
- `database/seeders/SettingsMenuSeeder.php` — seeds the menu/screen tree.

## Conventions this project inherited from a legacy ERP schema

Several patterns recur across nearly every table/model and are not standard
Laravel defaults — see `[[database]]` and `[[architecture]]` for details:
`unique_id` (masked route keys), `acc_year`, `sess_*` audit columns, and
`is_delete` boolean soft-deletes instead of the framework's `SoftDeletes`.
