# Folder Structure

```
app/
  Http/
    Controllers/
      Admin/            # one controller per admin resource (Vendor, Loa, PurchaseOrder, ...)
        Imports/         # settings import controller(s)
      Api/               # AuthController — small JSON API surface (register/login/logout)
      Auth/              # AuthenticatedSessionController — Inertia session login/logout
      Concerns/          # HasPaginatedIndex (shared list-page pagination)
    Middleware/          # HandleInertiaRequests
    Requests/
      Admin/
        Concerns/
        Imports/
        Store{X}Request.php / Update{X}Request.php   # one pair per resource
  Models/                # one Eloquent model per table, flat (no subfolders)
    Concerns/             # HasAuditSessionFields, HasMaskedRouteKey
  Exports/                 # maatwebsite/excel export classes
  Imports/                 # maatwebsite/excel import classes
  Repositories/
  Services/
  Support/                # MaskedIdentifier, etc. — small framework-agnostic helpers

database/
  factories/               # one factory per model
  migrations/              # timestamped, chronological
  seeders/
    DatabaseSeeder.php
    SettingsMenuSeeder.php  # seeds the UserScreen navigation tree
    UserTypeSeeder.php

resources/
  css/
    app.css                # Tailwind v4 CSS-first theme: all CSS custom properties
  js/
    actions/                # Wayfinder-generated typed controller-action helpers (build artifact)
    routes/                 # Wayfinder-generated typed named-route helpers (build artifact)
    lib/                    # shared frontend building blocks (NOT a components/ui/ dir):
      icons.tsx              # the whole icon catalog: ICONS, ICON_COLORS, ICON_CATEGORIES, IconChip, DynamicIcon
      icon-picker.tsx          # searchable icon combobox
      appearance-panel.tsx     # theme/accent/sidebar/font preferences popover
      use-preferences.tsx       # Preferences context (localStorage-persisted)
      export-toolbar.tsx, export-utils.ts
      multi-select.tsx, table-pagination.tsx, toast.tsx
      settings-import-modal.tsx, settings-import-actions.tsx
      alert-card.tsx           # renders an Alert record (severity styling)
      engineer-combobox.tsx    # searchable engineer picker, reused across forms
      details-modal.tsx        # generic read-only "view record" modal (buildDetailsFromRecord helper)
    layouts/
      admin-layout.tsx        # the one shared authenticated shell
    pages/
      login.tsx, dashboard.tsx
      admin/
        <resource>/            # kebab-case, one folder per resource
          index.tsx create.tsx edit.tsx <resource>-form-fields.tsx
        execution-plan/         # UI-only prototype (Gantt/milestones/checklist tabs), no backend yet — see [[business-overview]]
    types/                    # navigation.ts, index.ts, global.d.ts — shared TS types
  views/
    app.blade.php              # Inertia root template
    pdf/                        # dompdf Blade templates (LOA PDF, etc.)

routes/
  web.php                      # everything: guest routes, auth routes, admin.* resource routes
  api.php                      # tiny JSON auth API
  console.php

tests/
  Feature/                     # one *ControllerTest.php per resource, Pest syntax
  Feature/Auth/                # LoginTest.php

.claude/
  context/                     # this documentation set
```

Note: `routes/web.php` currently has a `GET /login1-preview` route rendering
`resources/js/pages/login1.tsx`, explicitly commented as a temporary preview
of a login redesign to be removed once reviewed — don't treat it as a
pattern to replicate for other pages.

## Naming patterns to follow

- Frontend page folders are **kebab-case** and mirror the backend
  `folder_name` used in routes (`purchase-orders`, `user-screens`, `schedule-names`).
- Each resource typically has its own `{resource}-form-fields.tsx` component
  shared between `create.tsx` and `edit.tsx` (see
  `user-screen-form-fields.tsx`, `vendor-form-fields.tsx`).
- Backend Form Requests are always `Store{Model}Request` / `Update{Model}Request`,
  one pair per resource, even when the rules are nearly identical.
