# Prompt: Optimize a Query

See `[[performance]]` and `[[database]]` for the underlying rules — this is
the step-by-step for applying them to a specific slow/inefficient query.

## 1. Confirm there's actually a problem

- Check for N+1s: does a `->map()`/`->through()`/Blade loop over a
  collection touch a relationship that wasn't eager-loaded? Every access to
  `$model->relation` inside a loop without a prior `->with('relation')` is
  one query per row.
- Check for over-fetching: is the query pulling `select('*')` (implicit,
  the Eloquent default) when only 2-3 columns are actually used downstream
  (a dropdown, a list column)?
- Check for missing pagination: is a list endpoint doing a bare `->get()`
  instead of going through `HasPaginatedIndex`?

## 2. Fix in this order of preference

1. **Column-scope eager loads**: `->with(['state:id,name', 'district:id,name'])`
   instead of `->with(['state', 'district'])` — matches
   `VendorController::index()`.
2. **Push filtering into the query**: `->where('is_delete', false)`,
   `->when($search !== '', ...)` — never filter a fully-hydrated collection
   in PHP/JS when the DB can do it.
3. **Select only needed columns** for reference/option lists:
   `->get(['id', 'name'])`.
4. **Use `HasPaginatedIndex::paginateQuery()`** rather than a bare
   `->get()`/hand-rolled `LengthAwarePaginator`.
5. **Add a DB index** via a new migration if a `->where()`/`->orderBy()`
   column that's frequently filtered/sorted on isn't indexed — check the
   relevant `create_*_table`/`add_*_to_*_table` migration for existing
   indexes before assuming one is missing.

## 3. Verify the fix actually reduced query count

- Feature test: assert against `DB::listen()`/`\DB::getQueryLog()` if the
  query-count regression is worth locking in permanently, or at minimum
  manually confirm via `php artisan telescope`/query log/`explain` that the
  N+1 is gone.
- Don't just eyeball the code and assume it's fixed — prove it.

## Don't

- Don't reach for caching as the first fix for a query that's just missing
  eager-loading or an index — fix the query shape first.
- Don't remove `is_delete`/`status` filtering to "simplify" a query — that's
  a correctness bug, not an optimization (`[[database]]`).
- Don't over-fetch "just in case a future feature needs it" — select what's
  needed now.

Then run the relevant Pest test(s) and, if the query backs a list page,
manually confirm the page still renders correctly with the same data.
