import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { DynamicIcon } from '@/lib/icons';
import { index } from '@/routes/admin/user-screens';

type UserScreenDetail = {
    unique_id: string;
    screen_name: string;
    main_screen: string | null;
    folder_name: string;
    order_no: number;
    icon: string;
    description: string | null;
    status: boolean;
    can_add: boolean;
    can_update: boolean;
    can_list: boolean;
    can_delete: boolean;
    can_view: boolean;
    can_cancel: boolean;
    created_at: string | null;
};

type UserScreenShowProps = {
    userScreen: UserScreenDetail;
};

function DetailField({
    label,
    value,
}: {
    label: string;
    value: string | null;
}) {
    return (
        <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--color-ink)]/55 uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink)]">
                {value ?? '—'}
            </p>
        </div>
    );
}

function PermissionBadge({
    label,
    granted,
}: {
    label: string;
    granted: boolean;
}) {
    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                granted
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
            }`}
        >
            {label}
        </span>
    );
}

export default function UserScreenShow({ userScreen }: UserScreenShowProps) {
    return (
        <AdminLayout
            title={`User Screen - ${userScreen.screen_name}`}
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
                            User Screen
                        </Link>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            {userScreen.screen_name}
                        </span>
                    </div>
                    <Link
                        href={index.url()}
                        className="rounded-lg border border-[var(--color-gold)]/30 px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/75 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Back
                    </Link>
                </div>
            }
        >
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6">
                <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
                        <DynamicIcon
                            name={userScreen.icon}
                            className="h-5 w-5"
                        />
                    </span>
                    <div>
                        <p className="text-lg font-semibold text-[var(--color-ink)]">
                            {userScreen.screen_name}
                        </p>
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                userScreen.status
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-600'
                            }`}
                        >
                            {userScreen.status ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <DetailField
                        label="Main Screen"
                        value={userScreen.main_screen}
                    />
                    <DetailField
                        label="Folder Name"
                        value={userScreen.folder_name}
                    />
                    <DetailField
                        label="Order No"
                        value={String(userScreen.order_no)}
                    />
                    <DetailField
                        label="Created"
                        value={userScreen.created_at}
                    />
                    <div className="sm:col-span-2">
                        <DetailField
                            label="Description"
                            value={userScreen.description}
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-ink)]/55 uppercase">
                        Permissions
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <PermissionBadge
                            label="Add"
                            granted={userScreen.can_add}
                        />
                        <PermissionBadge
                            label="Update"
                            granted={userScreen.can_update}
                        />
                        <PermissionBadge
                            label="List"
                            granted={userScreen.can_list}
                        />
                        <PermissionBadge
                            label="Delete"
                            granted={userScreen.can_delete}
                        />
                        <PermissionBadge
                            label="View"
                            granted={userScreen.can_view}
                        />
                        <PermissionBadge
                            label="Cancel"
                            granted={userScreen.can_cancel}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
