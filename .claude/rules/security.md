# Security Rules

## Known current gaps — be honest about these, don't paper over them

- **No authorization layer**: every Form Request's `authorize()` returns
  `true`. `UserScreen.can_*` flags exist but are not enforced anywhere (see
  `[[permissions]]`). Don't write code that *assumes* permission checks
  happen — if a task requires restricting an action, that logic needs to be
  built, not assumed to already exist.
- **Duplicated auth surface**: both an Inertia session flow and a
  `web`-guarded JSON API (`/api/login` etc.) authenticate the same `User`
  model (see `[[authentication]]`). Be deliberate about which one you're
  touching.

## IDs and route binding

- Route-model binding uses `HasMaskedRouteKey`, which encrypts the
  `unique_id` (`Crypt::encryptString`, base64url-encoded) as the actual route
  parameter — never expose a raw auto-increment `id` or raw `unique_id` UUID
  in a URL for a new resource; apply the same trait so masking is automatic.
- Masked tokens can carry an expiry (`MaskedIdentifier::DEFAULT_TTL_SECONDS`)
  — don't assume a masked ID is valid forever if you generate one with a
  custom TTL.

## Input validation

- Every mutating request goes through a Form Request — never trust
  `$request->input(...)` unvalidated in a controller.
- File uploads are constrained with `mimes:` + `max:` (see
  `StoreVendorRequest`'s `pan_proof`/`bank_proof` rules,
  `mimes:jpg,jpeg,png,pdf`, `max:2048`) — apply the same pattern (allow-list
  extensions, cap size) to any new upload field, and store outside the
  publicly-served docroot via `Storage::disk('public')` the same way
  existing controllers do, never a raw `move()` to a guessed path.
- Regex-validate structured government/financial identifiers (PAN, GST,
  IFSC, pincode) the same way `StoreVendorRequest` does — don't accept them
  as free text.

## Passwords & auth

- `User.password` is cast `'hashed'` — assigning a plain string to it
  auto-hashes; never call `Hash::make()` a second time on top of that cast,
  and never call it when the model attribute already has the cast (check
  before copying a pattern from a non-`User` model like `Vendor`, which
  hashes manually in the controller since it isn't cast).
- Login failure messages are deliberately generic (`'Invalid login
  details'`) to avoid revealing whether a username/email exists — keep that
  property if you touch auth error messages.
- Never log passwords, tokens, or full request bodies of auth endpoints.

## Mass assignment

- `#[Fillable([...])]` is explicit per model — when adding a field, add it
  to the attribute list deliberately; don't widen it to accept arbitrary
  input, and don't bypass it with `forceFill()` outside of trusted internal
  code (e.g. the audit-stamping trait, which legitimately needs to set
  system-managed columns).

## Output

- React auto-escapes rendered text — never use `dangerouslySetInnerHTML` for
  anything sourced from user/database input.
- PDF generation (`barryvdh/laravel-dompdf`) renders Blade templates
  (`resources/views/pdf/`) — data interpolated into those templates goes
  through Blade's `{{ }}` escaping the same as any other Blade view; don't
  switch to `{!! !!}` for user-controlled data.

## Secrets

- `.env` is never committed; don't hardcode credentials, API keys, or the
  app key anywhere in `app/`, `config/`, or `resources/`.
- CSRF protection is Laravel's default (`web` middleware group, which both
  the Inertia routes and `/api/*` run through) — don't disable it for new
  routes.
