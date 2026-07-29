# Authentication

There are **two auth entry points** in the codebase, but as of this writing
only one is actually wired to the login page — worth understanding both
before touching either:

## 1. Session/Inertia login (the actual UI flow)

- `resources/js/pages/login.tsx` renders a login/register form and submits
  via Inertia's own `router.post(storeSession.url(), {...}, { onError,
  onFinish })` — `storeSession` is the Wayfinder-generated action for
  `AuthenticatedSessionController@store`. Validation errors flow back
  through Inertia's normal error channel (captured in `onError` into local
  `errors` state), not a raw `fetch()` call.
- `AuthenticatedSessionController::store()` type-hints a dedicated
  `App\Http\Requests\Auth\LoginRequest` rather than doing `Auth::attempt`
  inline in the controller:
  - Accepts either an email or a username in one `email` field
    (`credentials()` picks `email` vs `username` via
    `filter_var(..., FILTER_VALIDATE_EMAIL)`).
  - Rate-limits by `email|ip` (`RateLimiter`, 5 attempts, fires a `Lockout`
    event and a "Too many attempts" message on the `email` error key when
    exceeded) — standard Laravel Breez-style throttling, not present
    in the old JSON-API-only flow.
  - Enforces the CAPTCHA answer (see below) via `withValidator()`.
- `AuthenticatedSessionController` also owns `POST /logout` and the
  `guest`/`auth` middleware groups in `routes/web.php`, as before.

## CAPTCHA (new)

Login has two CAPTCHA modes, chosen by whether hCaptcha is configured
(`config('services.hcaptcha.site_key')` / `.secret_key`, from
`HCAPTCHA_SITE_KEY`/`HCAPTCHA_SECRET_KEY` env vars — see `config/services.php`):

- **hCaptcha configured**: `AuthenticatedSessionController::create()` passes
  `hcaptchaSiteKey` to the page; `login.tsx` injects the
  `js.hcaptcha.com/1/api.js` script and renders the widget into a
  `#login-captcha` container, storing the token in local state and posting
  it as `h_captcha_response`. `LoginRequest::rules()` requires it and
  validates via `App\Rules\HCaptcha` (a first-party rule, not a package —
  no hCaptcha Composer/npm dependency was added).
- **hCaptcha not configured (the default/dev case)**: falls back to a local
  SVG text CAPTCHA. `GET /captcha` → `App\Http\Controllers\Auth\CaptchaController::image()`
  generates a 5-character random string, renders it as a scribbled/rotated-text
  SVG, and stashes the expected answer in `session('login_captcha.answer')`.
  `login.tsx` shows the SVG plus a plain text input (`captcha_answer`);
  `LoginRequest::withValidator()` compares the submitted answer against the
  session value server-side.
- Either way, submission is also blocked client-side in `login.tsx` until an
  answer/token is present.

## 2. JSON API (`routes/api.php` → `App\Http\Controllers\Api\AuthController`) — currently orphaned from the UI

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
- This endpoint's own `login()` independently validates `h_captcha_response`
  via `App\Rules\HCaptcha` when hCaptcha is configured — duplicating the
  check `LoginRequest` now also does for the Inertia flow.
- **Nothing in `login.tsx` calls this controller anymore** — the single
  `submit` handler always posts to `AuthenticatedSessionController@store`
  regardless of `mode`; toggling to "register" only changes which fields
  render (adds a Name field), it doesn't route to `/api/register`. Treat
  register-mode as **currently non-functional in the UI** rather than
  assuming this JSON API backs it — if asked to fix registration, that's the
  gap to close (either wire the register form to `/api/register`, or build a
  proper Inertia registration flow and retire this controller).

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

- Laravel's built-in `auth`/`guest` groups are used directly in
  `routes/web.php` for login/logout vs. everything else.
- **Authorization** (as opposed to authentication) is handled separately by
  `AuthorizeAdminActions` + `PreventAdminDelete`, applied to the whole
  `admin.` route group — see `[[permissions]]` for the full role/permission
  logic; this file only covers login/logout/session identity.
- `HandleInertiaRequests` shares `auth.user` (nullable) on every Inertia
  response regardless of route.
- `bootstrap/app.php` renders JSON automatically for `api/*` routes or
  `expectsJson()` requests (`shouldRenderJsonWhen`), rather than redirecting
  to a login page on 401/419.

## Known gaps

- The `Api\AuthController` register/login/logout surface is now dead code
  from the UI's perspective (see above) — it still works if called directly,
  but nothing exercises it, and the in-UI "register" mode is broken as a
  result.
- The local SVG CAPTCHA's answer is plain text in the session — fine for a
  low-stakes bot deterrent, but don't mistake it for a security boundary.
