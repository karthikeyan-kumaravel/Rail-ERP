# Permissions

## Current state: enforced via middleware + a per-role permission table

`UserType` is the role concept (`users.user_type_id` → `user_types.id`,
`hasMany`/`belongsTo`). There are **two separate `can_*` flag sets** —
don't confuse them:

- `UserScreen.can_add/can_update/can_list/can_delete/can_view/can_cancel` —
  six flags **per screen**, editable via the User Screen admin UI
  (`resources/js/pages/admin/user-screens/*`). These are still **not**
  read by any authorization check — they describe what a screen
  theoretically supports, not who can do it.
- `UserTypePermission.can_view/can_add/can_update/can_delete` — four flags
  **per `(user_type_id, user_screen_id)` pair**, in the `user_type_permissions`
  table (`app/Models/UserTypePermission.php`). Editable via
  `resources/js/pages/admin/user-type-permissions/{index,edit}.tsx`
  (`admin.user-type-permissions.index/edit/update` — no create/store/destroy;
  rows are provisioned per role/screen combination, not freely created).
  **This is the table that's actually enforced.**

## Enforcement: `AuthorizeAdminActions` middleware

`app/Http/Middleware/AuthorizeAdminActions.php` (registered as
`'authorize.admin'` in `bootstrap/app.php`, applied to the whole `admin.`
route group in `routes/web.php` alongside `PreventAdminDelete`) runs on
every `admin.*`-named route:

1. Unauthenticated → `abort(401)`. Non-`admin.*` routes pass through
   untouched.
2. Resolve the user's role via `Str::slug($user->userType?->name)`.
   - `superadmin` → always allowed, no further checks.
   - `admin` → blocked from any `PUT`/`PATCH`/`DELETE` request and from any
     `.edit`-named route (`abort(403)`); everything else (including `.create`
     and `POST`) passes. This is a **hardcoded role-name rule**, not backed
     by `UserTypePermission` rows.
   - Any other role → `GET` requests always pass; for
     `POST`/`PUT`/`PATCH`/`DELETE`, the middleware derives the target screen
     from the route name's second segment (`admin.{module}.*` →
     `UserScreen::where('folder_name', $module)`) and looks up the matching
     `UserTypePermission` row for `($user->user_type_id, $screen->id)`. No
     screen or no permission row → `abort(403)`. Otherwise: `.create`/`POST`
     → `can_add`, `.edit`/`PUT`/`PATCH` → `can_update`, `DELETE` →
     `can_delete`; anything else is denied by default.
3. `PreventAdminDelete` (a second, narrower middleware in the same group)
   independently blocks any `admin`-role user from `DELETE` requests —
   redundant with step 2's `admin` check but kept as a belt-and-suspenders
   guard.

**Practical implication**: adding a new admin resource means also adding
`UserTypePermission` rows (or provisioning via the
`admin.user-type-permissions` UI) for every non-`admin`/`superadmin` role
that should be able to touch it — a screen with no matching row is fully
locked out for those roles, silently (a 403, not a helpful message about a
missing permission row).

## What else is implemented

- **Navigation visibility**: `UserScreen::navigationTree()` filters by
  `status` (screen enabled/disabled) and `is_delete` only — every
  authenticated user still sees the same sidebar regardless of role; only
  the *action* (not the nav *link*) is gated by the middleware above.
- **Screen hierarchy**: a screen can have a `main_screen_id` parent, forming
  a 2-level tree (parent = collapsible section, child = leaf nav item).
  Nothing enforces a maximum depth, but the seeder and frontend both assume 2
  levels.

## Remaining gaps

- The frontend doesn't know about `UserTypePermission` — no button/action is
  hidden client-side based on the current user's permissions; a user without
  `can_update` still sees an Edit button and only discovers the 403 on
  submit. `HandleInertiaRequests::share()` still only shares the raw
  `auth.user` record (see `[[architecture]]`) — exposing resolved
  permissions there is the natural next step if UI-level hiding is wanted.
  `UserScreen.can_*` remains unused; if it's meant to be superseded by
  `UserTypePermission`, that migration hasn't happened.

## Related: masked route keys are not an access control mechanism

`HasMaskedRouteKey` (see `[[database]]`) obscures IDs in URLs but does **not**
check whether the current user is allowed to view/edit the resolved record —
the `AuthorizeAdminActions` check above is what actually gates that, and only
does so at the route/action level, not per-record.
