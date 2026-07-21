# Anti-AI-Style Rules

Guardrails against the specific ways generated code tends to look
"AI-written" rather than like the rest of this codebase. If a diff violates
one of these, it should be rewritten before it's considered done.

## Comments

- Don't narrate what the code obviously does (`// loop through vendors`,
  `// set the icon`). If removing a comment wouldn't confuse the next
  reader, it shouldn't be there.
- Don't reference the current task/fix/ticket in a comment
  (`// fix for issue where...`, `// added for the LOA import flow`) — that
  belongs in the commit message, not the source, and rots as the code
  evolves away from the reason it was written.
- Do write a comment when there's a genuinely non-obvious constraint or
  workaround — see `HasAuditSessionFields::bootHasAuditSessionFields()`'s
  comment about why `??=` doesn't work with the masked `unique_id` accessor.
  That's the bar: explain the *why* behind something surprising, never the
  *what*.
- No decorative comment banners (`// ===== SECTION =====`), no emoji in
  comments or output.

## Defensive coding for things that can't happen

- Don't add null-checks, try/catch, or fallback branches for states Laravel/
  Eloquent/TypeScript already guarantee won't occur. If a Form Request has
  already validated `state_id` exists, the controller doesn't need to
  re-check it.
- Don't wrap straightforward Eloquent calls in try/catch "just in case" —
  let framework exceptions propagate and be handled by the app's normal
  exception handling, matching every existing controller (none of them
  catch generic exceptions).
- Only validate at real boundaries: user input (Form Requests), external
  data (imports, API payloads) — not between your own internal function
  calls.

## No premature abstraction

- Don't extract a helper/trait/component for something used once. Three
  similar inline blocks are better than a speculative shared abstraction
  built for a future case that doesn't exist yet.
- Don't add config flags, feature flags, or "pluggable" strategy patterns for
  a single current use case. Follow the existing per-resource controller/page
  duplication pattern (see `[[architecture]]`) rather than trying to
  DRY it into a generic "resource factory" — this codebase intentionally
  favors copy-paste-and-adjust per resource over cleverness.

## Naming

- No generic placeholder names (`data`, `item`, `result`, `handleClick`,
  `temp`) when a descriptive name is one word away (`vendor`, `loaItem`,
  `resolvePerPage`, `toggleGroup`) — match the descriptive-naming style
  already used throughout `app/` and `resources/js/`.
- Don't invent new suffixes/prefixes ("Enhanced", "Improved", "New",
  "V2") for a component/class that replaces an old one — rename or replace
  it outright.

## Don't pad diffs

- Don't reformat, reorder imports, or "clean up" unrelated code in a file
  you're touching for an unrelated reason — Prettier/ESLint/Pint already own
  formatting; a functional diff should stay scoped to the actual change.
- Don't add a README, docstring block, or summary comment at the top of a
  new file "for clarity" unless asked — file purpose should be evident from
  its name and its sibling files (see `[[coding-standards]]`).
- Don't leave half-finished implementations, TODOs for "future
  enhancements," or speculative unused parameters — ship the complete,
  narrow thing that was asked for.

## Matching the house style over generic "best practice"

- This codebase has real, consistent conventions (legacy audit columns,
  `is_delete` soft-deletes, masked route keys, per-resource controller
  shape) that diverge from vanilla Laravel defaults on purpose — see
  `[[architecture]]` and `[[database]]`. Don't "fix" these toward textbook
  Laravel (e.g. adding `SoftDeletes`, using framework route-model binding on
  raw IDs) without being asked; that would break consistency with every
  other resource.
