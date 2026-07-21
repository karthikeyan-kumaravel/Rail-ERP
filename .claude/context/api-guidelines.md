# API Guidelines

## There isn't really a "public API" — Inertia is the primary surface

Almost the entire application (`routes/web.php`) is Inertia responses, not
JSON: controllers call `Inertia::render('admin/x/index', [...])` and the
response is HTML-on-first-load / a JSON-encoded page-object on subsequent
Inertia visits — handled transparently by the `@inertiajs/react` client, not
something route handlers construct themselves. **Don't add `->json()`
responses to admin resource controllers** — return `Inertia::render(...)` or
a `redirect()->route(...)` with flash data, matching every existing
controller.

## The one real JSON surface: `routes/api.php`

```php
Route::middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
```

- Mounted on the `web` middleware group (session/cookie auth + CSRF), **not**
  `api` — there's no token auth (no Sanctum/Passport) anywhere in this app.
- Responses are `JsonResponse` with a `message` key plus payload
  (`{"message": "...", "user": {...}}`), and validation failures raise
  `ValidationException` the normal Laravel way (422 + `errors`).
- `bootstrap/app.php` forces JSON error rendering for any route under
  `api/*` or any request with `expectsJson()`:
  ```php
  $exceptions->shouldRenderJsonWhen(
      fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
  );
  ```

## Resource routing conventions

- Nearly every admin resource uses `Route::resource(...)->except('show')` —
  there's no dedicated "show" page for most resources (list + create + edit
  covers it); don't add a `show` route/controller method unless the resource
  genuinely needs a read-only detail view (LOA is the one exception —
  `Route::resource('loas', LoaController::class)` keeps `show`, plus a custom
  `GET loas/{loa}/pdf` route for PDF export).
- Custom action routes are added **inside** the resource group, near their
  resource, not in a separate file — see `loas/items/import-preview` and
  `loas/{loa}/pdf` sitting right above `Route::resource('loas', ...)`.
- Bulk import endpoints follow a fixed 4-route shape per module under
  `admin.imports.*` (`template`, `preview`, `store`, `logs/{id}/errors`) —
  see `SettingsImportController`; replicate this shape for any new
  importable module rather than inventing new endpoint names.

## Route-model binding uses masked keys

Every resource route parameter (e.g. `{vendor}`, `{loa}`) binds against the
model's `unique_id` through an **encrypted, maskable token** — see
`HasMaskedRouteKey` in `[[architecture]]`/`[[database]]`. Frontend code must
use the `unique_id` value the backend already sent (it's pre-masked) when
building links — never construct a route URL from a raw numeric ID.

## Validation

Every mutating endpoint takes a dedicated `Store{X}Request`/`Update{X}Request`
Form Request (`app/Http/Requests/Admin/`), not inline `$request->validate()`
in the controller (the one exception is the small `Api\AuthController`, which
validates inline since it's outside the admin resource pattern). Follow the
existing request classes' style: `authorize(): bool` returning `true`
(no policy layer yet — see `[[permissions]]`), `prepareForValidation()` for
normalization (e.g. uppercasing PAN/IFSC codes), a `rules()` method with
array-shape PHPDoc, and a `messages()` method for regex-rule custom text.
