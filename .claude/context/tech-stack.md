# Tech Stack

## Backend

- **PHP** 8.3
- **Laravel** ^13.17 (framework), routing via `bootstrap/app.php` (no
  `Http/Kernel.php` — the new Laravel 11+/13 bootstrap style)
- **Inertia Laravel** (`inertiajs/inertia-laravel`) ^3.0 — server-side glue for
  the React frontend
- **Database**: MySQL in dev (`DB_CONNECTION=mysql`, see `.env`); **SQLite
  in-memory** for the test suite (`phpunit.xml`)
- **Laravel Wayfinder** (`laravel/wayfinder` + `@laravel/vite-plugin-wayfinder`)
  — generates typed TS route/action helpers under `resources/js/actions/` and
  `resources/js/routes/`
- **maatwebsite/excel** (`4.x-dev`) — Excel import/export (settings import,
  LOA item import)
- **barryvdh/laravel-dompdf** ^3.1 — PDF generation (e.g. LOA PDF export)
- **laravel/tinker**, **laravel/pail** (log tailing), **laravel/sail** (dev
  containers, not the primary dev workflow here — see `composer.json`'s `dev`
  script instead)

### Backend tooling (dev dependencies)

- **Pest** ^4.7 + `pest-plugin-laravel` — the test framework (not PHPUnit
  syntax directly, though PHPUnit ^12 is underneath)
- **Laravel Pint** ^1.27 — code formatter, run via `vendor/bin/pint --dirty`
- **Larastan / PHPStan** ^3.9 — static analysis (`composer run types:check`)
- **Laravel Boost** ^2.2 — MCP/agent tooling integration (see the Boost
  guidelines block in `CLAUDE.md`)
- **fakerphp/faker**, **mockery** — test doubles/fixtures

## Frontend

- **React** ^19.2 (with `babel-plugin-react-compiler` enabled)
- **@inertiajs/react** ^3.0 — client-side Inertia adapter
- **TypeScript** ^5.7
- **Tailwind CSS** ^4.0 (via `@tailwindcss/vite`, CSS-first config — no
  `tailwind.config.js`; theme lives in `resources/css/app.css`)
- **Vite** ^8.0 (`laravel-vite-plugin` ^3.1)
- **lucide-react** ^1.24 — icon library (see `resources/js/lib/icons.tsx`)
- **clsx**, **tailwind-merge** — className composition utilities

### Frontend tooling

- **ESLint** ^9 (flat config, `eslint.config.js`) with
  `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`,
  `eslint-plugin-import`, `@stylistic/eslint-plugin`
- **Prettier** ^3.4 + `prettier-plugin-tailwindcss` (class sorting)
- No component library (no shadcn/ui, no Radix, no Heroicons/Tabler) — the
  sidebar, form fields, popovers (Appearance panel, Icon picker), pagination,
  toasts, export toolbar, and multi-select are all hand-built in
  `resources/js/lib/*.tsx`.

## Key npm scripts

```bash
npm run dev          # vite dev server
npm run build         # production build
npm run lint / lint:check
npm run format / format:check
npm run types:check    # tsc --noEmit
```

## Key composer scripts

```bash
composer run dev       # php artisan serve + queue:listen + vite, concurrently
composer run lint       # pint --parallel
composer run types:check # phpstan analyse
composer run test       # config:clear + lint:check + types:check + artisan test
```
