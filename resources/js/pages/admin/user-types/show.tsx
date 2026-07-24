import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/user-types';

type UserTypeShow = {
    unique_id: string;
    name: string;
    active_status: boolean;
    users_count: number;
    created_at: string | null;
};

type ShowProps = {
    userType: UserTypeShow;
};

function DetailRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-gold)]/15 py-2.5 last:border-b-0">
            <span className="text-xs font-medium tracking-wide text-[var(--color-ink)]/55 uppercase">
                {label}
            </span>
            <span className="text-right text-sm font-semibold text-[var(--color-ink)]">
                {value}
            </span>
        </div>
    );
}

export default function UserTypesShow({ userType }: ShowProps) {
    return (
        <AdminLayout
            title="View User Type"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / User Type
                    </Link>
                    <span className="mx-1.5 text-[var(--color-ink)]/40">/</span>
                    <span className="font-semibold text-[var(--color-ink)]">
                        View
                    </span>
                </div>
            }
        >
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--color-ink)]">
                            {userType.name}
                        </h2>
                        <p className="text-sm text-[var(--color-ink)]/60">
                            Read-only details for this user type.
                        </p>
                    </div>
                    <Link
                        href={index.url()}
                        className="rounded-lg border border-[var(--color-gold)]/25 px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Back to list
                    </Link>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
                    <DetailRow label="User Type Name" value={userType.name} />
                    <DetailRow
                        label="Status"
                        value={userType.active_status ? 'Active' : 'Inactive'}
                    />
                    <DetailRow label="Assigned Users" value={userType.users_count} />
                    <DetailRow label="Created" value={userType.created_at ?? '—'} />
                </div>
            </div>
        </AdminLayout>
    );
}
