import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/users';

type UserDetail = {
    unique_id: string;
    name: string;
    username: string | null;
    email: string;
    mobile_no: string | null;
    user_type: string | null;
    created: string | null;
};

type UserShowProps = {
    user: UserDetail;
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

export default function UserShow({ user }: UserShowProps) {
    return (
        <AdminLayout
            title={`User - ${user.name}`}
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
                            User Creation
                        </Link>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            {user.name}
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
                <div className="grid gap-6 sm:grid-cols-2">
                    <DetailField label="Staff Name" value={user.name} />
                    <DetailField label="User Name" value={user.username} />
                    <DetailField label="Email" value={user.email} />
                    <DetailField label="Mobile No" value={user.mobile_no} />
                    <DetailField label="User Type" value={user.user_type} />
                    <DetailField label="Created" value={user.created} />
                </div>
            </div>
        </AdminLayout>
    );
}
