import { router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import AlertCard from '@/lib/alert-card';
import type { AlertCardData } from '@/lib/alert-card';
import { PaginationFooter, PerPageSelect } from '@/lib/table-pagination';
import type { PerPageValue } from '@/lib/table-pagination';
import { index } from '@/routes/admin/alerts';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type Filters = {
    severity: '' | 'critical' | 'warning';
    per_page: PerPageValue;
};

type AlertsIndexProps = {
    alerts: Paginated<AlertCardData>;
    activeCount: number;
    filters: Filters;
};

const SEVERITY_OPTIONS: { value: Filters['severity']; label: string }[] = [
    { value: '', label: 'All Alerts' },
    { value: 'critical', label: 'Critical' },
    { value: 'warning', label: 'Warning' },
];

export default function AlertsIndex({
    alerts,
    activeCount,
    filters,
}: AlertsIndexProps) {
    const applySeverity = (severity: Filters['severity']) => {
        router.get(
            index.url(),
            { ...filters, severity, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const applyPerPage = (perPage: PerPageValue) => {
        router.get(
            index.url(),
            { ...filters, per_page: perPage, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout
            title="Alerts & Reminders"
            header={
                <div>
                    <h1 className="text-xl font-semibold text-[var(--color-ink)]">
                        Alerts & Reminders
                    </h1>
                    <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                        {activeCount} active{' '}
                        {activeCount === 1 ? 'alert' : 'alerts'}
                    </p>
                </div>
            }
        >
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <PerPageSelect
                        value={filters.per_page}
                        onChange={applyPerPage}
                    />

                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="alert-severity-filter"
                            className="text-sm text-[var(--color-ink)]/70"
                        >
                            Filter:
                        </label>
                        <select
                            id="alert-severity-filter"
                            value={filters.severity}
                            onChange={(event) =>
                                applySeverity(
                                    event.target.value as Filters['severity'],
                                )
                            }
                            className="rounded-md border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                        >
                            {SEVERITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {alerts.data.length === 0 && (
                        <p className="py-8 text-center text-[var(--color-ink)]/55">
                            No alerts found.
                        </p>
                    )}
                    {alerts.data.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))}
                </div>

                <PaginationFooter
                    from={alerts.from}
                    to={alerts.to}
                    total={alerts.total}
                    links={alerts.links}
                />
            </div>
        </AdminLayout>
    );
}
