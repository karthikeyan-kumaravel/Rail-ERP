# Review Checklist

Run through this before considering any change finished — consolidates the
individual `[[linting]]`/`[[testing]]`/`[[git]]` rules into one pass.

## Every change

- [ ] Matches sibling files' existing structure/conventions rather than
      inventing a new pattern (`[[anti-ai-style]]`, `[[coding-standards]]`).
- [ ] No stray comments explaining the obvious, no task/ticket references
      left in code, no commented-out code (`[[anti-ai-style]]`, `[[sonar]]`).
- [ ] No new dependency added without explicit approval
      (`[[coding-standards]]`).
- [ ] No documentation files created unless explicitly requested.

## PHP changes

- [ ] `vendor/bin/pint --dirty --format agent` run (`[[pint]]`).
- [ ] `composer run types:check` passes (`[[phpstan]]`).
- [ ] New/changed model applies `HasAuditSessionFields` + `HasMaskedRouteKey`
      if it's a domain model (`[[laravel]]`, `[[database]]`).
- [ ] Any new table has the full legacy audit column block + `is_delete`
      (`[[database]]`).
- [ ] All queries against domain tables filter `is_delete` where relevant
      (`[[database]]`).
- [ ] `destroy()` soft-deletes (`update(['is_delete' => true])`), never a
      real `->delete()` (`[[laravel]]`).
- [ ] Store/Update Form Requests exist and are used, not inline
      `$request->validate()` (`[[laravel]]`, `[[api-guidelines]]`).
- [ ] A Pest test exists/was updated proving the change
      (`[[testing]]`), run with the narrowest relevant `--filter`.

## Frontend changes

- [ ] `npx tsc --noEmit` passes (`[[typescript]]`).
- [ ] `npx eslint <file>` passes, including on `import/order`,
      `consistent-type-imports`, `react-hooks` rules (`[[eslint]]`).
- [ ] `npm run format` applied — don't hand-order Tailwind classes or
      imports (`[[prettier]]`).
- [ ] `npm run build` succeeds.
- [ ] Any new `IconKey` is mirrored exactly in `UserScreen::ICONS`
      (PHP) — check both lists match (`[[ui-guidelines]]`, `[[database]]`).
- [ ] New overlays/popovers follow the existing `createPortal` +
      outside-click/Escape pattern (`[[react]]`).
- [ ] Accessible: labeled inputs, `aria-*` on custom controls, keyboard
      close/focus handled (`[[accessibility]]`).
- [ ] **Actually driven in a running browser** (dev server or headless
      Playwright), not just type-checked/linted — screenshot or describe
      what was observed, including checking the browser console for errors
      (`[[testing]]`).

## Security pass

- [ ] No raw IDs exposed in new URLs — masked route keys used
      (`[[security]]`).
- [ ] File uploads (if any) constrained by `mimes:`/`max:` and stored via
      `Storage::disk('public')`, not a raw path (`[[security]]`).
- [ ] No secrets/credentials committed; `.env` untouched in git status
      review (`[[security]]`, `[[git]]`).
- [ ] Don't assume `UserScreen.can_*` flags gate anything — no
      authorization layer exists yet (`[[permissions]]`, `[[security]]`).

## Before pushing / opening a PR

- [ ] `git status`/`git diff --staged` reviewed — nothing swept in by a
      broad `git add`, nothing that looks like a secret (`[[git]]`).
- [ ] Targeting the right base branch (`develop`/`main`/`master`/`workos` are
      the ones CI watches) (`[[git]]`).
- [ ] Commit message explains *why*, not just *what* (`[[git]]`).
- [ ] `composer run ci:check` (or the equivalent subset for the change)
      passes locally before relying on CI to catch it (`[[linting]]`).
