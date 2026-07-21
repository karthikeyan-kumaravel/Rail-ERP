# Workflow: Bug Fix

The process view of `[[fix-bug]]` — read that for the technical specifics of
diagnosing common failure classes in this codebase.

## 1. Reproduce

Get to a failing test or an observed broken behavior in a running browser
before writing any fix. If there's no existing test covering the area,
that's the first gap to note.

## 2. Isolate root cause

Work backward from the symptom to the actual cause — see `[[fix-bug]]`'s
list of the most common root causes in this codebase (missing `is_delete`
filtering, masked-route-key decode failures, `IconKey` TS/PHP mirror
mismatches, `set-state-in-effect` React bugs).

## 3. Write the regression test first

Add/update a Pest test that fails against the current (buggy) code, proving
it actually exercises the bug — then confirm it fails before touching the
fix. See `[[testing]]`.

## 4. Fix narrowly

Smallest change that resolves the root cause. No drive-by refactors, no
"while I'm here" cleanups — file those separately if worth doing
(`[[refactor]]`, `[[anti-ai-style]]`).

## 5. Verify

- The new/updated test passes.
- The rest of that resource's test file still passes (a fix can regress a
  neighboring case).
- For frontend bugs: reload the actual page in a browser and confirm the
  fix, check the console for new errors.
- Run the relevant gate (`[[pint]]`/`[[phpstan]]` or `[[eslint]]`/
  `[[typescript]]`) for whatever was touched.

## 6. Note pre-existing unrelated failures

If the test suite already has known-failing tests unrelated to this bug
(this repo currently has a few around `UserScreen` order-number/nav-tree
ordering), don't silently "fix" them as part of an unrelated bug-fix diff —
call them out separately.

## 7. Commit

Message explains the root cause and the fix, not just "fix bug" — see
`[[git]]`. Only commit when explicitly asked to.
