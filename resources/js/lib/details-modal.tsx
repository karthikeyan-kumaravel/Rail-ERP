import { useEffect } from 'react';
import { XIcon } from '@/lib/icons';

export type DetailItem = {
    label: string;
    value: string | number;
};

export function resolveRecordTitle(record: Record<string, unknown>): string {
    const name = record.name;
    const label = record.screen_name;
    const title =
        typeof name === 'string' && name.trim()
            ? name
            : typeof label === 'string' && label.trim()
              ? label
              : 'Record details';

    return title;
}

export function buildDetailsFromRecord(
    record: Record<string, unknown>,
): DetailItem[] {
    return Object.entries(record)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .filter(([key]) => key !== 'unique_id')
        .map(([key, value]) => ({
            label: key
                .split('_')
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' '),
            value:
                typeof value === 'boolean'
                    ? value
                        ? 'Yes'
                        : 'No'
                    : typeof value === 'number' || typeof value === 'string'
                      ? value
                      : String(value),
        }));
}

type DetailsModalProps = {
    title: string;
    details: DetailItem[];
    onClose: () => void;
};

export default function DetailsModal({
    title,
    details,
    onClose,
}: DetailsModalProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4 py-6"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Record details"
                className="w-full max-w-xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl sm:p-6"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-ink)]">
                            {title}
                        </h3>
                        <p className="text-sm text-[var(--color-ink)]/60">
                            Read-only details for this record.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        title="Close"
                        aria-label="Close details"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink)]/60 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)]"
                    >
                        <XIcon className="h-4.5 w-4.5" />
                    </button>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-3 sm:p-4">
                    {details.map((detail) => (
                        <div
                            key={detail.label}
                            className="flex items-center justify-between gap-4 border-b border-[var(--color-gold)]/15 py-2.5 last:border-b-0"
                        >
                            <span className="text-xs font-medium tracking-wide text-[var(--color-ink)]/55 uppercase">
                                {detail.label}
                            </span>
                            <span className="text-right text-sm font-semibold text-[var(--color-ink)]">
                                {detail.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
