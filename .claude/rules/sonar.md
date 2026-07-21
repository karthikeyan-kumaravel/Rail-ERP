# Sonar Rules

## Current state: not configured

There is no `sonar-project.properties`, no SonarQube/SonarCloud CI step, and
no Sonar-related dependency anywhere in this repo as of this writing. This
file is **forward-looking guidance** — the kind of code-smell/duplication/
complexity issues a Sonar-style analyzer would flag — to keep in mind since
neither Pint, Larastan, nor ESLint fully cover this ground. If Sonar is
introduced later, treat this file as the starting checklist for what its
default quality profile would likely surface in this codebase.

## Cognitive complexity

- Keep controller methods and React components to a single clear
  responsibility — the existing per-resource controllers (`index`, `create`,
  `store`, `edit`, `update`, `destroy`) are already a good model of "one
  short method per concern" (see `[[architecture]]`). If a method grows
  several nested conditionals deep, extract a private method with a
  descriptive name rather than adding another nesting level.
- Avoid deeply nested ternaries or chained `? :` beyond one level in JSX —
  prefer an early return, a small helper function, or a `Record` lookup
  (see `[[typescript]]` on preferring `Record`s over `switch`/if-chains).

## Duplication

- This codebase intentionally duplicates *structure* across resources
  (every controller/request/page follows the same shape) — that is a
  deliberate convention, not the kind of duplication Sonar penalizes.
  What *is* worth deduplicating: identical non-trivial logic copy-pasted
  verbatim across three or more places (e.g. the audit-column migration
  block already lives as a documented copy-paste pattern in `[[laravel]]`/
  `[[database]]` precisely because it's boilerplate, not because it's fine
  to fork it and let copies drift).

## Dead code

- No commented-out code left in a diff (Sonar's `S125` equivalent) — delete
  it; git history already preserves it.
- No unused imports, variables, or parameters — ESLint's `no-unused-vars`
  (part of the recommended configs already enabled) and PHPStan both catch
  most of this; don't silence either to keep dead code around "just in
  case."

## Security hotspots

- Regex-based validation (PAN/GST/IFSC/pincode patterns) should be
  anchored and bounded (`^...$`) as the existing rules already are — an
  unanchored regex is a classic Sonar security-hotspot flag.
- Any new use of `Crypt::`/`Hash::`/raw cryptographic primitives should go
  through the existing `App\Support\MaskedIdentifier` pattern or Laravel's
  own facades — don't hand-roll encoding/hashing.

## Maintainability

- Magic numbers/strings that recur (page sizes, icon keys, accent colors)
  already live in one named constant (`HasPaginatedIndex::PER_PAGE_OPTIONS`,
  `UserScreen::ICONS`, `ACCENT_SWATCHES`) — follow that pattern for any new
  recurring literal rather than inlining it at each call site.
