import { Link } from '@inertiajs/react';

export type AlertCardData = {
    id: number;
    type: string;
    severity: 'critical' | 'warning';
    title: string;
    description: string;
    due_date: string | null;
    days_label: string;
    link_label: string;
    link_url: string | null;
};

const SEVERITY_STYLES: Record<
    AlertCardData['severity'],
    { border: string; dot: string; badge: string }
> = {
    critical: {
        border: 'border-l-red-500',
        dot: 'bg-red-500',
        badge: 'bg-red-50 text-red-600',
    },
    warning: {
        border: 'border-l-amber-500',
        dot: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-700',
    },
};

export default function AlertCard({ alert }: { alert: AlertCardData }) {
    const style = SEVERITY_STYLES[alert.severity];

    return (
        <div
            className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border border-l-4 border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm ${style.border}`}
        >
            <div className="flex min-w-0 items-start gap-3">
                <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                    aria-hidden="true"
                />
                <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-ink)]">
                        {alert.title}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--color-ink)]/70">
                        {alert.description}
                    </p>
                    {alert.link_url && (
                        <Link
                            href={alert.link_url}
                            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline"
                        >
                            Click to view <span aria-hidden="true">&rarr;</span>{' '}
                            {alert.link_label}
                        </Link>
                    )}
                </div>
            </div>
            <div className="shrink-0 text-right">
                {alert.due_date && (
                    <p className="text-xs text-[var(--color-ink)]/55">
                        {alert.due_date}
                    </p>
                )}
                <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${style.badge}`}
                >
                    {alert.days_label}
                </span>
            </div>
        </div>
    );
}
