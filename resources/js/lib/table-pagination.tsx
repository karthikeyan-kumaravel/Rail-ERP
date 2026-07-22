import { Link } from '@inertiajs/react';

export type PerPageValue = 10 | 25 | 50 | 100 | 250 | 500 | 'All';

export const PER_PAGE_OPTIONS: PerPageValue[] = [
    10,
    25,
    50,
    100,
    250,
    500,
    'All',
];

type PerPageSelectProps = {
    value: PerPageValue;
    onChange: (value: PerPageValue) => void;
};

export function PerPageSelect({ value, onChange }: PerPageSelectProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-ink)]/70">Show</span>
            <select
                value={value}
                onChange={(event) => {
                    const raw = event.target.value;
                    onChange(
                        raw === 'All' ? 'All' : (Number(raw) as PerPageValue),
                    );
                }}
                className="rounded-md border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-2 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
            >
                {PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <span className="text-sm text-[var(--color-ink)]/70">entries</span>
        </div>
    );
}

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginationFooterProps = {
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

export function PaginationFooter({
    from,
    to,
    total,
    links,
}: PaginationFooterProps) {
    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <p className="text-sm text-[var(--color-ink)]/60">
                Showing {from ?? 0} to {to ?? 0} of {total} entries
            </p>
            <div className="flex items-center gap-1">
                {links.map((link, i) => (
                    <Link
                        key={`${link.label}-${i}`}
                        href={link.url ?? '#'}
                        preserveState
                        className={`rounded-md px-3 py-1.5 text-sm transition ${
                            link.active
                                ? 'bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] font-semibold text-white'
                                : link.url
                                  ? 'text-[var(--color-ink)]/70 hover:bg-[var(--color-surface-soft)]'
                                  : 'cursor-not-allowed text-[var(--color-ink)]/30'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}
