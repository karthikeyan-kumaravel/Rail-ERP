# Accessibility Rules

## Baseline already established — match it

The hand-built overlay components already follow real accessibility
patterns; new interactive UI should match them, not fall back to plain
unlabeled `<div onClick>` soup.

## Interactive controls

- Every icon-only or ambiguous button needs a `title` and/or `aria-label`
  (see the sidebar collapse button, the Appearance panel trigger's
  `aria-label="Open appearance preferences"`).
- Toggle/disclosure buttons set `aria-expanded` and, when they control a
  distinct panel, `aria-controls={panelId}` pointing at that panel's `id`
  (generated via `useId()`) — see `AppearancePanel` and `IconPicker`.
- Popover/dialog-like panels get `role="dialog"` and `aria-label` describing
  their purpose (`aria-label="Select an icon"`).
- Selectable/toggle chips use `aria-pressed` to reflect selection state (see
  the accent-color swatches in `appearance-panel.tsx`, the icon buttons in
  `icon-picker.tsx`).

## Keyboard

- Any custom popover must close on `Escape` and on outside click — not just
  mouse-driven. When it opens, move focus into it (see `icon-picker.tsx`
  calling `searchRef.current?.focus()` on open).
- Don't build a new interactive control (dropdown, combobox, tab set)
  without keyboard support at least equivalent to what the existing
  popovers already provide — Escape-to-close and logical tab order at
  minimum.

## Forms

- Every input has a paired `<label htmlFor="...">` / `id="..."` — see the
  `labelClass` convention shared across every `{resource}-form-fields.tsx`.
  Never rely on placeholder text as the only label.
- Validation errors render as visible text adjacent to the field
  (`errorClass`), not color-only or icon-only — screen readers and
  colorblind users both need the text.
- Required-field affordance is explicit (`* Mandatory Fields` legend on
  forms) rather than relying on browser-native `required` styling alone.

## Color & contrast

- The sidebar is intentionally dark regardless of light/dark app theme —
  its text tokens (`--sidebar-ink`, `--sidebar-ink-soft`,
  `--sidebar-heading`) are tuned for contrast against that dark background
  independent of the `data-theme` attribute. Don't reuse the general
  `--color-ink` token inside the sidebar; it's computed for the *page*
  theme, not the always-dark sidebar, and can end up low-contrast there.
- Never encode meaning by color alone (e.g. "red border = error" also needs
  the text error message; "active accent color" nav item also gets a
  distinct background + left indicator, not just a color shift) — see how
  the sidebar's active state combines background, an inset accent bar, and
  full-opacity text, not color alone.

## Motion

- Respect the `data-animations` preference — anything animated should be a
  CSS `transition`/`animation` that the global
  `data-animations='off'` rule (`resources/css/app.css`) can zero out; don't
  build a custom animation driven by JS timers that ignores this preference.
