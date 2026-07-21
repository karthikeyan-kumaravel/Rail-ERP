# Prompt: Review Code

This is the "review a diff" version of `[[review-checklist]]` — read that
file for the full itemized list; this prompt is about *how* to conduct the
review, not just what to check.

## Order of passes

1. **Correctness first.** Does the change do what it claims? Trace the
   actual logic against the stated intent before looking at style.
2. **House-convention consistency.** Compare against the nearest sibling
   file (another controller, another form-fields component) — does this
   diverge from the established pattern without a stated reason? See
   `[[architecture]]`, `[[anti-ai-style]]`.
3. **The specific recurring failure modes in this codebase**:
   - Missing `is_delete`/`status` filtering on a new/changed query
     (`[[database]]`).
   - A `destroy()` that calls `->delete()` instead of soft-deleting.
   - A new model missing `HasAuditSessionFields`/`HasMaskedRouteKey` or the
     matching migration columns.
   - A new `IconKey` added on only one side (TS or PHP) of the required
     mirror (`[[ui-guidelines]]`).
   - Inline `$request->validate()` instead of a Form Request.
   - N+1s introduced in a list/index action (`[[performance]]`).
   - A frontend popover/overlay not following the portal +
     outside-click/Escape pattern, or a `set-state-in-effect` violation
     (`[[react]]`).
   - Hardcoded colors/hex instead of CSS custom properties
     (`[[ui-guidelines]]`).
   - A new npm/composer dependency added without it being an explicit,
     approved decision (`[[coding-standards]]`).
4. **Test coverage.** Is the change actually covered by a new/updated Pest
   test, not just "it compiles"? Is there evidence (described, not just
   claimed) that a frontend change was driven in a real browser?
5. **Gate results.** Confirm Pint/PHPStan/ESLint/Prettier/tsc/Pest were
   actually run and passed — don't take "should be fine" as sufficient.

## Reporting findings

- Lead with the most severe/likely-real finding, not a wall of nitpicks.
- For each finding: file + line, what's wrong, and the concrete failure
  scenario (what input/state breaks it) — not just "this could be better."
- Distinguish a confirmed bug from a stylistic preference; don't present
  both with the same weight.
- If nothing survives scrutiny, say so plainly rather than manufacturing
  minor nitpicks to seem thorough.

## Don't

- Don't rubber-stamp based on the diff "looking clean" — actually reason
  through edge cases (empty input, the `is_delete`/soft-deleted case,
  concurrent requests where relevant).
- Don't flag a deliberate, documented convention (e.g. `is_delete` instead
  of `SoftDeletes`, masked route keys, per-resource duplication) as if it
  were a mistake — check `[[architecture]]`/`[[database]]` before assuming
  something is wrong just because it's non-standard Laravel.
