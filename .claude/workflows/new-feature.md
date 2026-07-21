# Workflow: New Feature

End-to-end process for adding a new feature, tying together the relevant
prompts and rules in order.

## 1. Scope it

- Is this a whole new resource (`[[create-module]]`), an addition to an
  existing one (`[[create-crud]]`/`[[create-form]]`), a report
  (`[[create-report]]`), or a dashboard change (`[[create-dashboard]]`)?
  Pick the narrowest prompt that fits.
- If it needs a new dependency (a charting library, a new icon set, an auth
  mechanism) — flag that explicitly and get it approved before writing code
  around it (`[[coding-standards]]`).
- If it needs real permission enforcement — note that no authorization
  layer exists yet (`[[permissions]]`); building one is a distinct,
  larger task from "add a feature," call that out rather than quietly
  bolting ad-hoc checks onto one controller.

## 2. Backend

- Migration + model (if new) — full legacy audit column set, `is_delete`,
  `HasAuditSessionFields`/`HasMaskedRouteKey` (`[[database]]`, `[[laravel]]`).
- Form Requests, controller, routes — standard shape (`[[create-crud]]`).
- Write the Pest test(s) alongside the implementation, not after — see
  `[[testing]]`.

## 3. Frontend

- Page(s) + shared form-fields component if it's a form (`[[create-form]]`).
- Wire into the sidebar (`UserScreen` row, matching `folder_name`) if it's a
  new top-level resource (`[[create-module]]`).
- Any new `IconKey` mirrored in both `resources/js/lib/icons.tsx` and
  `UserScreen::ICONS` (`[[ui-guidelines]]`).
- Match existing styling/theming conventions — CSS custom properties, no
  new component library (`[[ui-guidelines]]`, `[[react]]`).

## 4. Gate

Run the full `[[review-checklist]]` — Pint, PHPStan, ESLint, Prettier, tsc,
Pest, and an actual browser pass of anything with a UI. Don't consider a
feature done on type-check/lint alone.

## 5. Review

Self-review against `[[review-code]]`'s recurring-failure-mode list before
handing it off, especially the `is_delete` filtering and soft-delete-not-
real-delete checks — these are the easiest things to miss when moving fast.

## 6. Commit / PR

Only when explicitly asked — see `[[git]]` for commit message and branch
expectations, and note the CI-watched branches (`develop`/`main`/`master`/
`workos`) that `lint.yml`/`tests.yml` will run against.
