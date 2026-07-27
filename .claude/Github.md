# GitHub.md

## Purpose
This file defines the standard Git workflow for the RailERP project. Follow these rules whenever performing Git operations.

---

# Project Information

- Project Name: RailERP
- Framework: Laravel 13
- Database: PostgreSQL / MariaDB (depending on environment)
- Version Control: Git + GitHub
- Default Branch: main

---

# Git Workflow

## Before Starting Work

Always perform these steps:

```bash
git status
git fetch origin
git pull origin main
```

Check for:
- Merge conflicts
- Uncommitted changes
- Staged files
- Branch status

Never overwrite local changes without confirmation.

---

## During Development

Commit only related changes.

Examples:

Feature:
```bash
git add .
git commit -m "feat(po): implement purchase order item quantity validation"
```

Bug Fix:
```bash
git commit -m "fix(loa): correct bid amount calculation"
```

UI:
```bash
git commit -m "ui(bank): improve bank master form layout"
```

Refactor:
```bash
git commit -m "refactor(permission): simplify role permission logic"
```

Docs:
```bash
git commit -m "docs(project): update implementation notes"
```

---

## Before Push

Always run:

```bash
git status
git fetch origin
git pull --rebase origin main
```

If conflicts occur:

- Stop
- Explain the conflict
- Suggest the safest resolution
- Never delete another developer's code automatically

Only push after a successful rebase.

```bash
git push origin main
```

---

# Commit Message Rules

Use Conventional Commits.

Examples:

feat:
- feat(po): add purchase order CRUD

fix:
- fix(loa): resolve quantity validation

ui:
- ui(login): redesign login screen

refactor:
- refactor(bank): optimize CRUD logic

docs:
- docs(readme): update setup guide

test:
- test(permission): add role validation tests

chore:
- chore(deps): update composer packages

---

# Pull Request Checklist

Before creating a PR:

- Project builds successfully
- No PHP errors
- No Laravel validation errors
- No console errors
- Database migrations tested
- Code follows project conventions

---

# Conflict Handling

If a merge conflict occurs:

1. Explain which files conflict.
2. Compare both versions.
3. Recommend the safest merge.
4. Preserve business logic.
5. Never remove another developer's code without explanation.

---

# Safety Rules

Never execute:

```bash
git reset --hard
```

Never execute:

```bash
git push --force
```

Unless explicitly instructed.

Never delete branches automatically.

Always ask before:
- Reverting commits
- Squashing commits
- Force pushing
- Deleting branches
- Rewriting history

---

# Branch Strategy

main
- Production-ready code only

feature/*
- New features

bugfix/*
- Bug fixes

hotfix/*
- Critical production fixes

---

# Ignore Files

Never commit:

.env
/vendor
/node_modules
/storage/logs
bootstrap/cache/*.php

---

# Laravel Checks Before Commit

Run if applicable:

```bash
php artisan optimize:clear
php artisan test
php artisan migrate --pretend
npm run build
```

Report any failures before pushing.

---

# Claude Instructions

Whenever asked to perform Git operations:

1. Check current Git status.
2. Explain what each command will do.
3. Recommend the safest workflow.
4. Warn before destructive operations.
5. Prefer `git pull --rebase` over merge when appropriate.
6. Use clear and meaningful commit messages.
7. Keep commits focused on a single feature or bug.
8. Never assume force push is acceptable.
9. If Git reports an error, explain the cause and provide the safest fix.
10. Preserve project history and avoid unnecessary merge commits.

---

# RailERP Module Commit Examples

feat(po): add purchase order creation workflow
fix(po): prevent duplicate PO entries
fix(po): update remaining quantity calculation
feat(loa): implement engineer assignment
fix(loa): correct rebate percentage calculation
feat(bank): complete bank master CRUD
fix(permission): resolve role-based access issue
ui(login): improve authentication page
feat(gantt): add execution plan module
docs(project): update implementation notes

# Branch Management

## Purpose

Always use a safe Git workflow that protects existing work and prevents accidental data loss.

---

# Before Creating a Branch

Always check:

```bash
git status
git branch
git fetch origin
```

Determine:

* Current branch
* Uncommitted changes
* Staged files
* Untracked files
* Remote updates

Explain the current repository state before proceeding.

---

# Creating a New Branch

If there are **no uncommitted changes**, create a feature branch from the latest `main`.

```bash
git checkout main
git pull origin main
git checkout -b feature/<feature-name>
```

Examples:

```bash
git checkout -b feature/purchase-order
git checkout -b feature/bank-master
git checkout -b feature/user-permission
git checkout -b feature/execution-plan
```

---

# Creating a Branch with Uncommitted Changes

If uncommitted changes are detected:

1. Do **not** discard the changes.
2. Do **not** force checkout.
3. Explain which files contain uncommitted changes.
4. Create a new branch from the current branch while preserving the working tree.

```bash
git checkout -b feature/<feature-name>
```

The uncommitted changes will automatically move to the new branch.

Example:

Current branch:

```
main
```

Modified files:

```
app/Http/Controllers/PurchaseOrderController.php
resources/js/pages/PO/Create.tsx
```

Create:

```bash
git checkout -b feature/purchase-order
```

Result:

* Current branch becomes `feature/purchase-order`
* All uncommitted changes remain intact
* Nothing is lost

---

# If Switching to Another Existing Branch

When the working tree contains uncommitted changes:

Check whether the checkout is safe.

If Git blocks the checkout:

Recommend one of these options:

### Option 1 (Preferred)

Create a new branch to preserve the current work.

### Option 2

Commit the changes first.

### Option 3

Stash the changes.

```bash
git stash push -m "WIP before switching branches"
git checkout <branch-name>
git stash pop
```

Never use stash automatically without user approval.

---

# Branch Naming Convention

Use descriptive branch names.

Features:

```
feature/purchase-order
feature/engineer-master
feature/bank-master
feature/loa-calculation
```

Bug fixes:

```
bugfix/remaining-quantity
bugfix/login-validation
bugfix/user-permission
```

Hotfixes:

```
hotfix/login
hotfix/security
```

Documentation:

```
docs/github-guide
docs/project-documentation
```

Refactoring:

```
refactor/purchase-order
refactor/permission
```

---

# Before Pushing a New Branch

Run:

```bash
git fetch origin
git status
```

Commit changes if required.

Push using:

```bash
git push -u origin <branch-name>
```

Example:

```bash
git push -u origin feature/purchase-order
```

---

# Safety Rules

Never execute:

```bash
git checkout -f
```

Never execute:

```bash
git reset --hard
```

Never execute:

```bash
git clean -fd
```

Unless I explicitly request it.

Never discard uncommitted work.

Never overwrite another developer's work.

Always explain the safest option before performing any operation.

---

# Claude Instructions

Whenever I ask to create a branch:

1. Check the current Git status.
2. Detect uncommitted changes.
3. Preserve all local work.
4. Create the branch using the safest workflow.
5. Explain every Git command before execution.
6. Warn before any destructive operation.
7. Never lose local changes.
8. Recommend a meaningful branch name based on the task.
9. If the branch already exists, explain the situation and suggest the next safest step.
10. Confirm that the new branch contains all expected changes before continuing.
