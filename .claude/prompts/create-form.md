# Prompt: Create a Form (Create/Edit Pages)

Use this for the frontend half of a resource — pairs with `[[create-crud]]`
for the backend. Read `[[react]]`, `[[ui-guidelines]]`, `[[typescript]]`
first.

## File layout

```
resources/js/pages/admin/{folder-name}/
  create.tsx
  edit.tsx
  {resource}-form-fields.tsx
```

## The shared form-fields component

```tsx
export type {Resource}FormData = {
    {field}: {type};
    // ...
};

type {Resource}FormFieldsProps = {
    data: {Resource}FormData;
    setData: <K extends keyof {Resource}FormData>(key: K, value: {Resource}FormData[K]) => void;
    errors: Partial<Record<keyof {Resource}FormData, string>>;
    // any option lists (states, districts, etc.)
};

const labelClass = 'mb-1.5 block text-xs font-medium tracking-wide text-[var(--color-gold)] uppercase';
const inputClass = 'w-full rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink)]/35 outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/40';
const errorClass = 'mt-1.5 text-xs font-bold text-red-600';

export default function {Resource}FormFields({ data, setData, errors, ... }: {Resource}FormFieldsProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label htmlFor="{field}" className={labelClass}>{Label}</label>
                    <input
                        id="{field}"
                        value={data.{field}}
                        onChange={(e) => setData('{field}', e.target.value)}
                        className={inputClass}
                    />
                    {errors.{field} && <p className={errorClass}>{errors.{field}}</p>}
                </div>
            </div>
        </div>
    );
}
```

Copy `resources/js/pages/admin/vendors/vendor-form-fields.tsx` or
`resources/js/pages/admin/user-screens/user-screen-form-fields.tsx` as the
literal starting point rather than writing this from scratch — they already
show file-upload fields, `<select>` reference-data dropdowns, and (in the
user-screens case) the `IconPicker` integration.

## Field type → widget

| Field needs | Use |
|---|---|
| Plain text/number/date | `<input>` with `inputClass` |
| Fixed reference-data choice (state, district) | `<select>` populated from a prop-passed option list |
| One of a small fixed set with visual weight | `SegmentedControl`-style buttons (see `appearance-panel.tsx`) if genuinely warranted — otherwise a `<select>` is fine and simpler |
| An `IconKey` | `IconPicker` (`resources/js/lib/icon-picker.tsx`) — never a native `<select>` for icons |
| Multiple values from a list | `resources/js/lib/multi-select.tsx` |
| File upload | `type="file"`, validated `mimes:`/`max:` server-side, previewed via a `_url` prop the controller computed with `Storage::disk('public')->url(...)` |

## Create/Edit page shells

```tsx
export default function {Resource}Create({ /* option lists */ }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm<{Resource}FormData>({
        // initial values
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(store().url);
    };

    return (
        <AdminLayout title="..." header={...}>
            <form onSubmit={submit}>
                <{Resource}FormFields data={data} setData={setData} errors={errors} {...optionLists} />
                <button type="submit" disabled={processing}>Save</button>
                <Link href={index().url}>Cancel</Link>
            </form>
        </AdminLayout>
    );
}
```

Import `store`/`index`/`update` from the Wayfinder-generated
`@/routes/admin/{folder-name}` — never hand-write the URL string
(`[[react]]`, `[[typescript]]`).

## Don't

- Don't invent new input styling — reuse `labelClass`/`inputClass`/
  `errorClass`.
- Don't manage form state with local `useState` instead of Inertia's
  `useForm` — you'd lose automatic error-bag wiring and `processing` state.
- Don't hardcode a route path string when a Wayfinder helper exists for it.

Then verify by actually driving the form in a browser (fill it, submit,
check validation errors render, check success redirect/flash) — type-check
and lint alone don't prove the form works (`[[testing]]`,
`[[review-checklist]]`).
