import { CheckIcon } from '@/lib/icons';
import type { ChecklistItem } from './execution-plan-mock-data';

type PreStartChecklistTabProps = {
    items: ChecklistItem[];
    onToggle: (id: string) => void;
    className?: string;
};

export default function PreStartChecklistTab({
    items,
    onToggle,
    className = '',
}: PreStartChecklistTabProps) {
    const doneCount = items.filter((item) => item.checked).length;

    return (
        <div className={className}>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:px-6">
                    <div>
                        <h2 className="text-base font-bold text-[var(--color-ink)]">
                            Pre-Start Checklist
                        </h2>
                        <p className="text-xs text-[var(--color-ink)]/50">
                            Confirm readiness before mobilizing site works
                        </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-bold text-[var(--color-accent)]">
                        {doneCount}/{items.length} Done
                    </span>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 shadow-sm">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="mt-0.5 h-5 w-5 shrink-0"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8h.01M11 12h1v4h1" />
                        </svg>
                        <p>
                            All items below must be confirmed before site
                            mobilization begins. This checklist is a soft
                            readiness gate for planning purposes only.
                        </p>
                    </div>

                    <ul className="space-y-2">
                        {items.map((item) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    aria-pressed={item.checked}
                                    onClick={() => onToggle(item.id)}
                                    className="flex w-full items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left shadow-sm transition hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-soft)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30 focus-visible:outline-none"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                                            item.checked
                                                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                                                : 'border-[var(--color-gold)]/40 text-transparent'
                                        }`}
                                    >
                                        <CheckIcon className="h-3.5 w-3.5" />
                                    </span>
                                    <span
                                        className={`text-sm font-medium ${
                                            item.checked
                                                ? 'text-[var(--color-ink)]/50 line-through'
                                                : 'text-[var(--color-ink)]'
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
