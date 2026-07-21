# Prompt: Refactor

Refactoring means changing structure **without** changing behavior. If the
request also wants new behavior, that's a feature/bug-fix task
(`[[create-crud]]`, `[[fix-bug]]`) layered on top — do the behavior change
and the structural change as separable concerns even if done in the same
session.

## Before

- **There must be test coverage of the current behavior first.** If the
  code being refactored isn't covered by a Pest test, write one that
  captures its current observable behavior before restructuring anything —
  otherwise there's no way to confirm the refactor didn't change behavior.
- Confirm the refactor is actually warranted — genuine duplication (the same
  non-trivial logic copy-pasted 3+ times), not the intentional per-resource
  structural repetition this codebase uses on purpose (see
  `[[anti-ai-style]]`, `[[sonar]]`).

## During

- Keep the diff to the structural change only — don't rename unrelated
  variables, reformat untouched code, or fix unrelated small bugs in the
  same pass (file those separately).
- Prefer the smallest structural change that removes the duplication/
  complexity: extract a private method or a `Concerns` trait matching the
  existing `Has{Capability}` naming convention (`[[naming-conventions]]`)
  before reaching for a bigger pattern (service classes, repositories,
  events) — this codebase is currently thin in `app/Services`/
  `app/Repositories`; don't introduce a new architectural layer for one
  refactor without it being clearly warranted.
- If extracting shared frontend UI, match the existing `resources/js/lib/`
  hand-built-component style rather than pulling in a component library
  (`[[react]]`).

## After

- Run the full existing test suite for the affected area, not just the new
  test — a refactor regressing *other* callers of the changed code is the
  main risk.
- Run `[[pint]]`/`[[phpstan]]` or `[[eslint]]`/`[[typescript]]` depending on
  what was touched.
- For a frontend refactor, manually re-verify the affected page(s) still
  render and behave identically — a passing type-check doesn't prove visual/
  interactive behavior is unchanged (`[[testing]]`).

## Don't

- Don't refactor and add new functionality in the same uncommitted change
  without being able to describe them as two separable diffs.
- Don't introduce a new abstraction "for future flexibility" — only
  refactor toward what's needed for the duplication that exists right now
  (`[[anti-ai-style]]`).
- Don't refactor code with no test coverage without adding coverage first —
  that's how a "safe" refactor silently changes behavior.
