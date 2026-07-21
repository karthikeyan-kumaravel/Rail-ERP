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
   dates, total stations covered. Financial security terms live alongside it:
   Bank Guarantee (amount + validity), security deposit, mobilization
   advance (amount + status).
3. **Scope breakdown** — `loa_items` are the BOQ/schedule line items under an
   LOA: item code/description, quantity + unit, unit rate, escalation,
   advertised value vs. bid rate/amount — i.e. the tendered-vs-won-rate
   comparison per line item. `loa_team_members` and `loa_stations` attach
   people and specific stations to an LOA.
4. **Procurement** — `purchase_orders` track supplier, ordered items, amount,
   delivery date, payment terms, and both quantity (ordered vs. received) and
   status (inspection/dispatch) — material sourcing to support execution.
5. **Execution resourcing** — `engineers` (with `engineer_types`),
   `departments`, `units`, `projects`, `activities`, `schedule_names`/
   `schedule_types` — the people/organizational/scheduling scaffolding for
   running the work day to day.
6. **Reporting/export** — Excel import/export (`maatwebsite/excel`, see
   `app/Imports`, `app/Exports`, `import_logs` for audit trail of bulk
   imports) and PDF generation (`barryvdh/laravel-dompdf`, e.g. the LOA PDF
   at `GET admin/loas/{loa}/pdf`).

## Terminology cheat-sheet

| Term | Meaning |
|---|---|
| **LOA** | Letter of Acceptance — the contract-award record |
| **BOQ** | Bill of Quantities — the itemized scope/pricing schedule (modeled as `loa_items`) |
| **BG** | Bank Guarantee — a financial security instrument tied to an LOA |
| **Mobilization advance** | Upfront payment to help the contractor mobilize resources for a won contract |
| **Defect liability period** | Post-completion warranty window during which the contractor remains liable for defects |
| **Division** (railway) | An organizational unit of the railway the LOA is awarded under/for — distinct from a company "department" |
| **acc_year** | Accounting/fiscal year string used for record-keeping, April-to-March boundary (see `[[database]]`) |

## What's aspirational vs. implemented

The **icon catalog** (`resources/js/lib/icons.tsx`, `UserScreen::ICONS`)
already anticipates a much larger feature surface than what's built today —
it includes concepts like Tender, Bid, Work Order, Gantt Chart, Inspection,
Inventory, Warehouse, Daily Progress, Billing, Bill Management, Payment
Tracker, Cash Flow, Budget, Invoice, Tax, Safety, Quality, and Compliance,
most of which **don't have a corresponding model/table/controller yet**.
Treat these as a roadmap signal (the menu/icon system was built ahead of the
features), not as evidence those modules exist — check `app/Models` and
`routes/web.php` before assuming a feature is implemented.
