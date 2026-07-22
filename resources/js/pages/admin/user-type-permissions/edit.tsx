import { Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/user-type-permissions';

type ScreenPermissionRow = {
    id: number;
    screen_name: string;
    group_name: string | null;
    can_view: boolean;
    can_add: boolean;
    can_update: boolean;
    can_delete: boolean;
};

type PermissionField = 'can_view' | 'can_add' | 'can_update' | 'can_delete';

type UserTypePermissionEditProps = {
    userType: { unique_id: string; name: string };
    screens: ScreenPermissionRow[];
};

type PermissionFormData = {
    permissions: {
        user_screen_id: number;
        can_view: boolean;
        can_add: boolean;
        can_update: boolean;
        can_delete: boolean;
    }[];
};

const permissionColumns: { key: PermissionField; label: string }[] = [
    { key: 'can_view', label: 'View' },
    { key: 'can_add', label: 'Add' },
    { key: 'can_update', label: 'Edit' },
    { key: 'can_delete', label: 'Delete' },
];

const checkboxClass =
    'h-4 w-4 rounded border-[var(--color-gold)]/40 text-[var(--color-accent)] focus:ring-[var(--color-accent)]/40';

export default function UserTypePermissionEdit({
    userType,
    screens,
}: UserTypePermissionEditProps) {
    const { flash } = usePage().props;
    const { data, setData, put, processing, errors } =
        useForm<PermissionFormData>({
            permissions: screens.map((screen) => ({
                user_screen_id: screen.id,
                can_view: screen.can_view,
                can_add: screen.can_add,
                can_update: screen.can_update,
                can_delete: screen.can_delete,
            })),
        });

    const toggleCell = (index: number, field: PermissionField) => {
        setData((current) => ({
            permissions: current.permissions.map((permission, i) =>
                i === index
                    ? { ...permission, [field]: !permission[field] }
                    : permission,
            ),
        }));
    };

    const toggleColumn = (field: PermissionField, checked: boolean) => {
        setData((current) => ({
            permissions: current.permissions.map((permission) => ({
                ...permission,
                [field]: checked,
            })),
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        put(update.url(userType.unique_id));
    };

    return (
        <AdminLayout
            title="User Type Permission"
            withBackgroundImage
            header={
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="text-sm">
                        <span className="text-[var(--color-ink)]/55">
                            Admin
                        </span>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <Link
                            href={index.url()}
                            className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                        >
                            User Type Permission
                        </Link>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            {userType.name}
                        </span>
                    </div>
                </div>
            }
        >
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6">
                {flash.success && (
                    <div className="mb-4 rounded-lg border border-[var(--color-accent-2)]/30 bg-[var(--color-accent-2)]/10 px-4 py-2 text-sm text-[var(--color-ink)]">
                        {flash.success}
                    </div>
                )}

                {errors.permissions && (
                    <p className="mb-4 text-xs font-bold text-red-600">
                        {errors.permissions}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] bg-[var(--color-accent)]/10 text-xs font-semibold tracking-wide text-[var(--color-accent)] uppercase">
                                    <th className="px-3 py-3">Screen</th>
                                    {permissionColumns.map((column) => (
                                        <th
                                            key={column.key}
                                            className="px-3 py-3 text-center"
                                        >
                                            <label className="flex flex-col items-center gap-1">
                                                <span>{column.label}</span>
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Toggle ${column.label} for every screen`}
                                                    checked={data.permissions.every(
                                                        (permission) =>
                                                            permission[
                                                                column.key
                                                            ],
                                                    )}
                                                    onChange={(event) =>
                                                        toggleColumn(
                                                            column.key,
                                                            event.target
                                                                .checked,
                                                        )
                                                    }
                                                    className={checkboxClass}
                                                />
                                            </label>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {screens.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-3 py-6 text-center text-[var(--color-ink)]/55"
                                        >
                                            No screens found.
                                        </td>
                                    </tr>
                                )}
                                {screens.map((screen, rowIndex) => (
                                    <tr
                                        key={screen.id}
                                        className="border-b border-[var(--color-border-softer)] text-[var(--color-ink)]/85 transition-colors hover:bg-[var(--color-bg-soft)]"
                                    >
                                        <td className="px-3 py-3">
                                            <p>{screen.screen_name}</p>
                                            {screen.group_name && (
                                                <p className="text-xs text-[var(--color-ink)]/50">
                                                    {screen.group_name}
                                                </p>
                                            )}
                                        </td>
                                        {permissionColumns.map((column) => (
                                            <td
                                                key={column.key}
                                                className="px-3 py-3 text-center"
                                            >
                                                <input
                                                    type="checkbox"
                                                    aria-label={`${column.label} ${screen.screen_name}`}
                                                    checked={
                                                        data.permissions[
                                                            rowIndex
                                                        ][column.key]
                                                    }
                                                    onChange={() =>
                                                        toggleCell(
                                                            rowIndex,
                                                            column.key,
                                                        )
                                                    }
                                                    className={checkboxClass}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <Link
                            href={index.url()}
                            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/75 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Save Permissions
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
