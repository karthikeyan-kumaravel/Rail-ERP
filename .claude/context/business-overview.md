# Business Overview

## Domain

Rail ERP supports the commercial and execution lifecycle of railway
infrastructure contracts — from winning a tender through to site delivery and
billing. It's built for a contracting/EPC-style organization (the seeded test
account's email domain is `aedindia.com`) that executes railway station and
track-related works for clients/railway divisions.

## Core lifecycle modeled so far

1. **Master/reference data** — geography (`states` → `districts` → `cities`),
   railway organizational structure (`zones`, `divisions`, `stations`), and
   parties (`customers`, `vendors`).
2. **Winning the work** — an **LOA (Letter of Acceptance)** is the central
   contract record once a tender is won: client, division, work type,
   contract value, completion period, defect liability period, start/end
   dates, total stations covered. Financial security terms are a related
   `loa_financial_securities` record per instrument (EMD, performance BG,
   security BG — see `LoaFinancialSecurity::TYPES`), each with amount,
   validity dates, claim period, an issuing `bank_id` (`banks` table), and an
   uploaded proof document — normalized out of `loas` itself; plus a
   separate security deposit.
3. **Scope breakdown** — `loa_items` are the BOQ/schedule line items under an
   LOA: item code/description, quantity + unit, unit rate, escalation,
   advertised value vs. bid rate/amount — i.e. the tendered-vs-won-rate
   comparison per line item. `loa_team_members` and `loa_stations` attach
   people and specific stations to an LOA.
4. **Procurement** — `purchase_orders` are now header records (PO number,
   order date, linked `loa_id`/`vendor_id`, delivery date, status, payment
   type) with the actual scope broken into `purchase_order_items` — one row
   per `loa_item_id` being ordered, tracking ordered/received/balance
   quantity and both GST-inclusive and GST-exclusive pricing against the
   vendor's quoted price (with a computed variance) — i.e. POs are placed
   *against* specific LOA line items, not as freestanding orders.
5. **Execution resourcing** — `engineers` (with `engineer_types`),
   `departments`, `units`, `projects`, `activities`, `schedule_names`/
   `schedule_types` — the people/organizational/scheduling scaffolding for
   running the work day to day. An `execution-plan` admin page (Gantt chart,
   milestones, pre-start checklist) exists in the frontend but is currently
   **UI-only, backed by mock data** — there's no `execution_plan`
   table/model/controller yet; treat it as a prototype, not a working
   feature, if asked to extend it.
6. **Alerting** — a generic, polymorphic `alerts` table
   (`Alert::alertable()`) with `type`/`severity` (critical/warning) and a
   `due_date`; currently only raises LOA-completion-approaching alerts
   (`Alert::TYPE_LOA_COMPLETION_APPROACHING`) but the shape supports
   alerting off any model.
7. **Reporting/export** — Excel import/export (`maatwebsite/excel`, see
   `app/Imports`, `app/Exports`, `import_logs` for audit trail of bulk
   imports) and PDF generation (`barryvdh/laravel-dompdf`, e.g. the LOA PDF
   at `GET admin/loas/{loa}/pdf`).

## Terminology cheat-sheet

| Term | Meaning |
|---|---|
| **LOA** | Letter of Acceptance — the contract-award record |
| **BOQ** | Bill of Quantities — the itemized scope/pricing schedule (modeled as `loa_items`) |
| **BG** | Bank Guarantee — a financial security instrument tied to an LOA |
| **Defect liability period** | Post-completion warranty window during which the contractor remains liable for defects |
| **Division** (railway) | An organizational unit of the railway the LOA is awarded under/for — distinct from a company "department" |
| **acc_year** | Accounting/fiscal year string used for record-keeping, April-to-March boundary (see `[[database]]`) |

## What's aspirational vs. implemented

The **icon catalog** (`resources/js/lib/icons.tsx`, `UserScreen::ICONS`)
already anticipates a much larger feature surface than what's built today —
it includes concepts like Tender, Bid, Work Order, Inspection, Inventory,
Warehouse, Daily Progress, Billing, Bill Management, Payment Tracker, Cash
Flow, Budget, Invoice, Tax, Safety, Quality, and Compliance, most of which
**don't have a corresponding model/table/controller yet**. Treat these as a
roadmap signal (the menu/icon system was built ahead of the features), not
as evidence those modules exist — check `app/Models` and `routes/web.php`
before assuming a feature is implemented.

**Gantt Chart is a partial exception**: the `execution-plan` admin page
(route + React tabs) exists and renders a Gantt-style view, but it's wired
to local mock data (`execution-plan-mock-data.ts`), not a database table —
so the *page* exists ahead of the *backend*, one step further along than a
pure icon-only placeholder but still not a real feature.
