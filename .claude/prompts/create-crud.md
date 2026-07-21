# Prompt: Create CRUD for an Existing Model

Use this when the model/table already exists (or was just created) and you
need the standard admin controller + requests + routes. For the full
new-resource pipeline including migration and frontend, see
`[[create-module]]`.

Read `[[architecture]]`'s "Controller pattern" section first — this is that
pattern, spelled out method by method.

## Requests

```bash
php artisan make:request Admin/Store{Model}Request --no-interaction
php artisan make:request Admin/Update{Model}Request --no-interaction
```

- `authorize(): bool { return true; }` (no policy layer — `[[permissions]]`).
- `rules()` with array-shape PHPDoc, `Rule::exists(...)` scoped to
  `is_delete = false` for FKs, regex rules for structured fields, `messages()`
  for any custom regex error text.
- `prepareForValidation()` for normalization (uppercasing codes, trimming),
  not controller-side mutation.

## Controller

```bash
php artisan make:controller Admin/{Model}Controller --no-interaction
```

```php
class {Model}Controller extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', '{default_column}')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['{allowed}', '{sort}', '{columns}'], true)) {
            $sort = '{default_column}';
        }

        $query = {Model}::query()
            ->where('is_delete', false)
            ->when($search !== '', fn ($q) => $q->where('{column}', 'like', "%{$search}%"))
            ->orderBy($sort, $direction);

        ${models} = $this->paginateQuery($query, $perPage);

        ${models}->through(fn ({Model} $m) => [ /* explicit field list, not $m->toArray() */ ]);

        return Inertia::render('admin/{folder-name}/index', [
            '{models}' => ${models},
            'filters' => compact('search', 'sort', 'direction') + ['per_page' => $perPage],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/{folder-name}/create', [ /* option lists */ ]);
    }

    public function store(Store{Model}Request $request): RedirectResponse
    {
        {Model}::query()->create($request->validated());

        return redirect()->route('admin.{folder-name}.index')->with('success', '{Model} created successfully.');
    }

    public function edit({Model} $model): Response
    {
        return Inertia::render('admin/{folder-name}/edit', [
            '{model}' => $model->only([ /* explicit column list */ ]),
            /* option lists */
        ]);
    }

    public function update(Update{Model}Request $request, {Model} $model): RedirectResponse
    {
        $model->update($request->validated());

        return redirect()->route('admin.{folder-name}.index')->with('success', '{Model} updated successfully.');
    }

    public function destroy({Model} $model): RedirectResponse
    {
        $model->update(['is_delete' => true]);

        return redirect()->route('admin.{folder-name}.index')->with('success', '{Model} deleted successfully.');
    }
}
```

Adapt file-upload handling (`Storage::disk('public')`, delete-old-then-store-new
on update) if the resource has file fields — see `VendorController` for the
full pattern with two upload fields.

## Routes

```php
Route::resource('{folder-name}', {Model}Controller::class)->except('show');
```

Add inside the existing `admin.` group in `routes/web.php`, near
resources it's conceptually close to.

## Don't

- Don't call `->delete()` — always soft-delete via `is_delete`.
- Don't inline `$request->validate()` — always a dedicated Form Request.
- Don't `select('*')`/return `$model->toArray()` wholesale from `index()`/
  `edit()` — hand-pick the fields the frontend actually needs.
- Don't skip `HasPaginatedIndex` for a list with more than a handful of
  possible rows.

Then run `[[review-checklist]]`'s PHP-change section.
