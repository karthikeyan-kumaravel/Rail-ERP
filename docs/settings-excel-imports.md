# Settings Excel Imports

The Settings import framework supports Excel preview, validation, confirmed import, sample template downloads, and error report downloads for:

- State
- District
- City
- Zone
- Division
- Station
- Customer

## Setup

The feature uses Laravel Excel:

```bash
composer require maatwebsite/excel
php artisan migrate
```

This workspace does not currently expose `php` or `composer` on PATH, so `composer.lock` must be refreshed in the PHP-capable development environment.

## Routes

- `GET /admin/imports/{module}/template`
- `POST /admin/imports/{module}/preview`
- `POST /admin/imports/{module}/store`
- `GET /admin/imports/logs/{importLog}/errors`

Supported module slugs:

- `states`
- `districts`
- `cities`
- `zones`
- `divisions`
- `stations`
- `customers`

## Import Flow

1. User downloads a module-specific Excel template.
2. User uploads an `.xlsx` or `.xls` file from the module index page.
3. The backend validates the file type and parses the first sheet.
4. Empty rows are skipped.
5. Rows are validated and previewed with row numbers.
6. Duplicate rows are detected against existing records and within the file.
7. User confirms or cancels.
8. Confirmed rows are re-validated and inserted inside a database transaction.
9. An import log records the user, timestamp, counts, summary, and failed rows.
10. Failed/duplicate rows can be downloaded as an Excel error report.

## Counts

The JSON response includes:

- `total_records`
- `successfully_imported`
- `failed_records`
- `duplicate_records`
- `preview_valid_records`

## Duplicate Rules

- State: state name or state code
- District: state + district name
- City: district + city name
- Zone: zone name or zone code
- Division: railway zone + division name
- Station: station code
- Customer: customer name + contact number, or duplicate email when provided

## Template Rules

Each generated workbook contains:

- A data-entry sheet with required fields marked by `*`
- One or two example rows
- Styled header row
- Frozen header row
- Autofilter
- Text formatting for fields such as pincode and contact numbers
- An `Instructions` sheet with required fields, accepted values, import rules, examples, and validation notes

## Frontend

The reusable components are:

- `resources/js/lib/settings-import-actions.tsx`
- `resources/js/lib/settings-import-modal.tsx`

Every Settings index page uses the same component to keep behavior and styling consistent.
