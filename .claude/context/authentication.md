# Authentication

There are currently **two separate, overlapping auth entry points** — worth
understanding before touching either:

## 1. Session/Inertia login (the actual UI flow)

- `resources/js/pages/login.tsx` renders a login/register form.
- On submit, it calls `fetch('/api/login', ...)` or `/api/register`
  directly (bypassing Inertia's own form helpers), then on success does
  `window.location.href = '/dashboard'` — a hard navigation, not an Inertia visit.
- So the page that *looks* like it belongs to `AuthenticatedSessionController`
  (`routes/web.php`: `GET /login`, `GET /`) actually authenticates through
  the JSON API described below.
- `AuthenticatedSessionController` (under `App\Http\Controllers\Auth`) still
  owns `POST /logout` and the `guest`/`auth` middleware groups in
  `routes/web.php`.

## 2. JSON API (`routes/api.php` → `App\Http\Controllers\Api\AuthController`)

```php
Route::middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
```

Note it's mounted on the **`web` middleware group**, not `api` — so it's
still session/cookie-based (CSRF token required, `Auth::attempt` +
`$request->session()->regenerate()`), not token auth. There is no Sanctum,
Passport, or bearer-token layer in this app.

- **Login accepts either username or email** in one `login` field:
  ```php
  $loginField = filter_var($validated['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
  Auth::attempt([$loginField => $validated['login'], 'password' => $validated['password']]);
  ```
- Validation errors surface as a `ValidationException` with a single `login`
  key (`'Invalid login details'`) — deliberately vague to avoid
  user-enumeration.
- `register` hashes the password and immediately logs the user in.
- `logout` uses `Auth::guard('web')->logout()` + session invalidate/regenerate.

## User model

`App\Models\User` extends `Illuminate\Foundation\Auth\User`. Notable:

- `password` is cast `'hashed'` (auto-hashes on assignment — don't
  double-hash in controllers for `User` writes).
- `#[Hidden(['password', 'remember_token'])]` — attribute-based hidden
  fields (PHP 8 attribute, not the classic `protected $hidden = [...]`).
- `#[Fillable([...])]` similarly attribute-based.
- `userType(): BelongsTo` — every user has one `UserType` (role).
- A `saving` hook denormalizes `user_type_unique_id` from the raw
  `user_types.unique_id` column via `DB::table(...)->value(...)` — **not**
  `UserType::find()->unique_id`, because that would go through the masked
  route-key accessor (see `[[architecture]]`) and store the *encrypted mask*
  instead of the stable identifier.
- Uses `HasMaskedRouteKey` + `HasAuditSessionFields` like other domain models.

## Middleware

- No custom auth middleware beyond Laravel's built-in `auth`/`guest` groups
  used directly in `routes/web.php`.
- `HandleInertiaRequests` shares `auth.user` (nullable) on every Inertia
  response regardless of route.
- `bootstrap/app.php` renders JSON automatically for `api/*` routes or
  `expectsJson()` requests (`shouldRenderJsonWhen`), rather than redirecting
  to a login page on 401/419.

## Known gap

There's no CSRF/rate-limiting customization beyond Laravel defaults, and the
login page's direct-fetch approach means Inertia's shared error-bag
conventions aren't used for auth errors — they're handled with local
component state instead (see `login.tsx`).
