import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/districts';

type DistrictDetail = {
    unique_id: string;
    name: string;
    code: string | null;
    state: string | null;
    active_status: boolean;
    cities_count: number;
    created_at: string | null;
};

type DistrictShowProps = {
    district: DistrictDetail;
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

export default function DistrictShow({ district }: DistrictShowProps) {
    return (
        <AdminLayout
            title={`District - ${district.name}`}
            withBackgroundImage
            header={
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="text-sm">
                        <span className="text-[var(--color-ink)]/55">
                            Admin / Settings
                        </span>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <Link
                            href={index.url()}
                            className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                        >
                            District
                        </Link>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            {district.name}
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
                            {district.name}
                        </p>
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                district.active_status
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-600'
                            }`}
                        >
                            {district.active_status ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <DetailField label="State" value={district.state} />
                    <DetailField label="Code" value={district.code} />
                    <DetailField
                        label="Cities"
                        value={String(district.cities_count)}
                    />
                    <DetailField label="Created" value={district.created_at} />
                </div>
            </div>
        </AdminLayout>
    );
}
