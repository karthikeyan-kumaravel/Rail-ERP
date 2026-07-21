# Prompt: Fix a Bug

## 1. Reproduce before touching anything

Confirm the actual failure — run the relevant Pest test if one exists
(`php artisan test --compact --filter=...`), or drive the affected page/flow
in a browser for a frontend bug. Don't fix based on a guess at what's wrong.

## 2. Find the root cause, not the symptom

- If it's a query returning wrong/extra rows, check `is_delete`/`status`
  filtering first — the most common class of bug in this codebase is a
  missing `->where('is_delete', false)` (`[[database]]`).
- If it's a route/ID issue, check whether it's a `HasMaskedRouteKey`
  problem — masked tokens can expire, and `resolveRouteBindingQuery`
  returns a deliberately-impossible query (`whereRaw('0 = 1')`) when a token
  fails to decode, which looks like a 404, not an error (`[[architecture]]`,
  `[[security]]`).
- If it's a frontend state bug involving a popover/effect, check for the
  `set-state-in-effect` anti-pattern (state reset belongs at the
  action/close call site, not in a `useEffect` reacting to `open`) —
  see `[[react]]`.
- If it's an icon rendering as a fallback/grid icon, check whether the
  `IconKey` exists in **both** `resources/js/lib/icons.tsx` and
  `UserScreen::ICONS` — a mismatch between the two is the classic cause
  (`[[ui-guidelines]]`, `[[database]]`).

## 3. Write a regression test first when practical

Add/update the Pest test that would have caught this before writing the
fix, then confirm it fails, then fix, then confirm it passes. See
`[[testing]]`.

## 4. Fix narrowly

Change only what's needed to correct the bug. Don't use the opportunity to
refactor surrounding code, rename things, or "improve" unrelated logic in
the same diff — see `[[anti-ai-style]]` and use `[[refactor]]` separately if
a refactor is genuinely warranted.

## 5. Verify

- Run the specific test(s) affected, then the full relevant test file.
- For anything touching the frontend, actually load the page in a browser
  (dev server or headless) and confirm the fix — type-check/lint passing is
  not proof a UI bug is fixed (`[[testing]]`).
- Run `[[pint]]`/`[[phpstan]]` or `[[eslint]]`/`[[typescript]]` depending on
  what was touched.

## Don't

- Don't add defensive try/catch around the symptom instead of fixing the
  cause.
- Don't suppress a static-analysis or lint finding that surfaced the bug —
  fix what it's pointing at.
- Don't expand scope to "while I'm here" changes — file those as a separate
  follow-up if worth doing.
