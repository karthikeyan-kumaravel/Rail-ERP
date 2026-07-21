# Prompt: Create a Report (Export / PDF)

This app has two existing export mechanisms — use whichever matches what's
being asked for, don't introduce a third library.

## Excel export (`maatwebsite/excel`)

- Export classes live in `app/Exports/`.
- Pair with the existing `resources/js/lib/export-toolbar.tsx` +
  `export-utils.ts` frontend components for the "Export" button/menu, rather
  than building a new download UI from scratch.
- If the report is a **bulk import** counterpart (a template users fill in
  and re-upload), follow the `admin.imports.*` four-route shape already
  established (`template`/`preview`/`store`/`logs/{id}/errors`, see
  `SettingsImportController`) and log outcomes to `import_logs` for
  auditability — see `[[api-guidelines]]`, `[[performance]]`.
- Query the data the same way an `index()` action would: eager-load what's
  needed, filter `is_delete = false`, and avoid pulling more than the report
  needs into memory at once for large datasets (`maatwebsite/excel`
  supports chunked/queued exports if a report can get large — reach for that
  rather than a synchronous `->get()` over a big table).

## PDF (`barryvdh/laravel-dompdf`)

- Blade templates live in `resources/views/pdf/`.
- Controller action returns the rendered PDF directly (see
  `LoaController::pdf()` / `GET admin/loas/{loa}/pdf`) — a plain resource
  route added next to the relevant `Route::resource(...)` call, not a
  separate reports section.
- Data passed into the Blade template is escaped normally (`{{ }}`) — never
  switch to `{!! !!}` for anything derived from user/database input
  (`[[security]]`).
- Money/date formatting in the template should match how the same fields are
  formatted elsewhere in the app (e.g. `contract_value_amount` +
  `contract_value_unit` shown together, dates as `d M Y`) — check an
  existing index/show page's formatting before inventing a new convention.

## Dashboards / on-screen reports (not a file download)

If "report" actually means an on-screen aggregate view rather than an
export, see `[[create-dashboard]]` instead.

## Don't

- Don't add a new Excel/PDF/reporting library — `maatwebsite/excel` and
  `barryvdh/laravel-dompdf` already cover both cases.
- Don't build reports as synchronous, unpaginated `->get()` queries against
  large tables — reuse the query-scoping discipline from `[[performance]]`.

Add a Pest test asserting the export/PDF endpoint responds successfully and
(for Excel) that the expected sheet/column headers are present — see
`[[testing]]`.
