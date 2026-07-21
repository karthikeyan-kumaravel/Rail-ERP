# Permissions

## Current state: modeled, not enforced

`UserType` is the role concept (`users.user_type_id` → `user_types.id`,
`hasMany`/`belongsTo`). `UserScreen` carries six boolean capability flags per
screen:

```php
can_add, can_update, can_list, can_delete, can_view, can_cancel
```

These are stored, editable via the User Screen admin UI
(`resources/js/pages/admin/user-screens/*`), and validated on save — but as
of this writing **nothing in the application actually reads them to gate
access**. There is no `Gate::define`, no Policy classes, no `->authorize()`
call, and no middleware that checks a user's role against a screen's
`can_*` flags anywhere in `app/Http/Controllers` or `app/Providers`. Grepping
confirms zero usages.

Treat this as a **foundation for a permission system, not a working one**.
If you're asked to "restrict this action to users who have permission,"
that logic doesn't exist yet and needs to be built — don't assume the
`can_*` columns already gate anything.

## What *is* implemented

- **Navigation visibility**: `UserScreen::navigationTree()` filters by
  `status` (screen enabled/disabled) and `is_delete` only — every
  authenticated user currently sees the same sidebar, regardless of
  `user_type_id`.
- **Screen hierarchy**: a screen can have a `main_screen_id` parent, forming
  a 2-level tree (parent = collapsible section, child = leaf nav item).
  Nothing enforces a maximum depth, but the seeder and frontend both assume 2
  levels.

## Where role-based enforcement would plug in

If implementing real enforcement, the natural seams are:

1. A policy/gate keyed on `(User $user, UserScreen $screen, string $ability)`
   mapping to the `can_*` columns — `UserType` would need its own join table
   or direct FK to `user_screens` with per-type overrides (doesn't exist yet;
   currently `can_*` is a flat property of the screen, not per-role).
2. Controller-level `$this->authorize(...)` calls in each
   `Admin\{X}Controller`, following the existing per-resource controller
   pattern (see `[[architecture]]`).
3. `HandleInertiaRequests::share()` could additionally expose the current
   user's resolved permissions so the frontend can hide buttons/actions —
   nothing like that is shared today (`auth.user` is the raw user record).

## Related: masked route keys are not an access control mechanism

`HasMaskedRouteKey` (see `[[database]]`) obscures IDs in URLs but does **not**
check whether the current user is allowed to view/edit the resolved record —
don't mistake it for an authorization layer.
