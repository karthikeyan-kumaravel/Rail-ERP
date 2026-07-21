# Prompt: Create an API Endpoint

**Stop and check first**: does this actually need to be JSON? Almost every
feature in this app is an Inertia page, not a JSON API — see
`[[api-guidelines]]`. If what's being asked for is "a page that lists/
creates/edits X," use `[[create-crud]]` instead; this prompt is only for a
genuine non-Inertia JSON endpoint (e.g. an endpoint a mobile client, a
webhook, or a third-party integration would call).

## Where it goes

- `routes/api.php` — currently just `register`/`login`/`logout`
  (`App\Http\Controllers\Api\AuthController`). New JSON endpoints follow
  that file and controller namespace (`App\Http\Controllers\Api\...`), not
  `Admin\...`.
- Mount on the `web` middleware group unless there's a specific, deliberate
  reason to need stateless/token auth — this app has **no token auth**
  (no Sanctum/Passport) configured, so a `Route::middleware('api')` group
  would currently have no working auth story. Don't add Sanctum/Passport as
  a side effect of one endpoint without approval (`[[coding-standards]]`).

## Shape to follow (see `Api\AuthController`)

```php
class {Name}Controller extends Controller
{
    public function {action}(Request $request): JsonResponse
    {
        $validated = $request->validate([
            // rules inline is acceptable here specifically, since this
            // controller sits outside the Admin resource/Form-Request
            // convention — for anything non-trivial, still prefer a
            // dedicated Form Request.
        ]);

        // ... do the thing ...

        return response()->json([
            'message' => 'Human-readable summary.',
            // payload
        ], $statusCode);
    }
}
```

- Validation failures naturally become a 422 JSON response with `errors` —
  `bootstrap/app.php` already forces JSON error rendering for any `api/*`
  route (`shouldRenderJsonWhen`), so don't add your own exception handling
  for that.
- Keep responses to a `message` + payload shape, matching the existing
  auth endpoints, unless the consumer needs a different contract.

## Don't

- Don't return `Inertia::render(...)` from anything under `routes/api.php`.
- Don't add a new auth mechanism (tokens, API keys) without explicit
  approval — flag the gap and ask rather than quietly bolting on Sanctum.
- Don't duplicate an existing Inertia admin resource as a second JSON API
  "just in case" — build the JSON endpoint only when there's a real
  non-browser consumer.

See `[[security]]` for input validation and secret-handling expectations
that apply here too.
