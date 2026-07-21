# Workflow: Code Review

The process view of `[[review-code]]` (technique) and `[[review-checklist]]`
(itemized list) — this is how those fit into an actual PR review.

## 1. Understand the change before judging it

Read the PR description/commit messages for *why*, then read the full diff
— not just the first file. For a multi-file change (e.g. a new module
touching migration + model + controller + requests + routes + frontend
pages), verify the pieces are consistent with each other (route segment ==
`folder_name` == frontend folder name, `IconKey` present on both TS and PHP
sides, etc.) — see `[[naming-conventions]]`.

## 2. Confirm CI is green

`lint.yml` (Pint, `npm run format`/`lint`) and `tests.yml` (PHPStan across
PHP 8.3/8.4/8.5, full Pest suite) both run on PRs targeting `develop`/
`main`/`master`/`workos`. Don't approve a PR with red CI on the assumption
"it's probably just flaky" — investigate or ask.

## 3. Run the itemized checklist

Work through `[[review-checklist]]` directly against the diff — it's
written as a checklist specifically so it can be applied mechanically,
covering the PHP-change list, frontend-change list, security pass, and
pre-push checks.

## 4. Apply the recurring-failure-mode list

`[[review-code]]` lists the specific bug classes that recur in this
codebase (missing `is_delete` filtering, real deletes instead of soft
deletes, `IconKey` mirror mismatches, N+1s, hardcoded colors, unapproved
dependencies) — scan for these explicitly, they're easy to miss in a
casual read-through.

## 5. Verify test coverage is real, not just present

A new test file existing isn't sufficient — confirm it actually exercises
the changed behavior (would it have failed against the old code?), and that
frontend changes were actually driven in a browser, not just type-checked.

## 6. Give actionable feedback

- Most severe/likely-real finding first.
- File + line + concrete failure scenario, not vague "this could be
  cleaner."
- Separate "this is a bug" from "this is a style preference" — don't block
  a PR on the latter unless it violates an explicit rule
  (`[[coding-standards]]`, `[[anti-ai-style]]`).
- If the change is genuinely fine, say so — don't manufacture nitpicks to
  look thorough.

## Don't

- Don't flag intentional codebase conventions (legacy audit columns,
  `is_delete` soft-deletes, per-resource structural duplication, masked
  route keys) as mistakes — confirm against `[[architecture]]`/`[[database]]`
  before raising them.
- Don't approve based on the diff "looking right" without reasoning through
  at least the empty-input and soft-deleted-record edge cases.
