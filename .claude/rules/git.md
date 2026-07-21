# Git Rules

## Branches watched by CI

`.github/workflows/lint.yml` and `tests.yml` both trigger on push/PR to
`develop`, `main`, `master`, and `workos`. Know which of these you're
targeting before opening a PR — pushing directly to one of these without a
PR skips review even though CI still runs.

## Commits

- Write commit messages that explain **why**, not a restatement of the diff
  — this repo's own history is currently terse (`"user type changes"`,
  `"Initial commit"`); don't take that as license to keep being vague going
  forward. Prefer a short imperative summary line, with a body only if the
  motivation isn't obvious from the summary.
- Only create commits when explicitly asked to. Don't commit as a side
  effect of finishing a task unless told to.
- Prefer a new commit over amending, unless explicitly asked to amend —
  amending a commit that already failed a pre-commit hook rewrites the
  *previous* commit, not the failed one, and can silently discard work.
- Never use `--no-verify`, `--no-gpg-sign`, or otherwise bypass hooks unless
  explicitly instructed.

## Destructive operations

- Never force-push to `main`/`master` (or any of the CI-watched branches
  above) without explicit instruction — warn first if asked.
- Before any command that can discard uncommitted work (`checkout`,
  `restore`, `reset --hard`, `clean`), run `git status` first and stash
  (`-u` for untracked) anything at risk.
- Treat unfamiliar untracked files/branches as someone's in-progress work
  until confirmed otherwise — this repo currently has a large amount of
  legitimately untracked-but-real application code (see `git status` at any
  point in this project's history), so don't assume "untracked" means
  "safe to discard."

## Staging

- Stage specific files by name, not `git add -A`/`git add .` — this repo's
  `.env` and any credential-bearing files must never be swept in
  accidentally.
- Re-check `git status`/`git diff` after a broader `add` before committing,
  and double-check file contents (not just the filename) before pushing if
  anything looks like it could carry a secret.

## Pull requests

- Keep the PR title short (<70 chars); put detail in the description.
- Include a test plan in the PR body — what was run, what to manually
  verify (see `[[testing]]`, `[[review-checklist]]`).
- Don't push directly without being asked; when asked to open a PR, use
  `gh pr create` against the correct base branch.
