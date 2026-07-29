import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/zones';

type ZoneDetail = {
    unique_id: string;
    name: string;
    code: string | null;
    active_status: boolean;
    divisions_count: number;
    created_at: string | null;
};

type ZoneShowProps = {
    zone: ZoneDetail;
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

export default function ZoneShow({ zone }: ZoneShowProps) {
    return (
        <AdminLayout
            title={`Zone - ${zone.name}`}
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
                        <span className="text-[var(--color-ink)]/55">
                            Settings
                        </span>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <Link
                            href={index.url()}
                            className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                        >
                            Zone
                        </Link>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            {zone.name}
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
                    <div>
                        <p className="text-lg font-semibold text-[var(--color-ink)]">
                            {zone.name}
                        </p>
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                zone.active_status
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-600'
                            }`}
                        >
                            {zone.active_status ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <DetailField label="Code" value={zone.code} />
                    <DetailField
                        label="Divisions"
                        value={String(zone.divisions_count)}
                    />
                    <DetailField label="Created" value={zone.created_at} />
                </div>
            </div>
        </AdminLayout>
    );
}
