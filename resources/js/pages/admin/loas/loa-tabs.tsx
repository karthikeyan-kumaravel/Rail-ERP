export type LoaTabKey = 'details' | 'items' | 'financial' | 'team' | 'scope';

type LoaTabsProps = {
    active: LoaTabKey;
    onChange: (tab: LoaTabKey) => void;
    hasError: (tab: LoaTabKey) => boolean;
    isLocked: (tab: LoaTabKey) => boolean;
};

const tabs: { key: LoaTabKey; label: string }[] = [
    { key: 'details', label: 'LOA Details' },
    { key: 'items', label: 'LOA Item Details' },
    { key: 'financial', label: 'Financial Security' },
    { key: 'team', label: 'Project Team' },
    { key: 'scope', label: 'Scope of Work' },
];

export const LOA_TAB_ORDER = tabs.map((tab) => tab.key);

export default function LoaTabs({
    active,
    onChange,
    hasError,
    isLocked,
}: LoaTabsProps) {
    return (
        <div className="mb-6 flex flex-wrap items-center gap-1 border-b border-[var(--color-gold)]/25">
            {tabs.map((tab) => {
                const isActive = active === tab.key;
                const locked = !isActive && isLocked(tab.key);
                const showErrorDot = !isActive && !locked && hasError(tab.key);

                return (
                    <button
                        key={tab.key}
                        type="button"
                        disabled={locked}
                        title={
                            locked
                                ? 'Save & Continue through the earlier tabs first'
                                : undefined
                        }
                        onClick={() => onChange(tab.key)}
                        className={`relative -mb-px flex items-center gap-1.5 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                            isActive
                                ? 'border-transparent bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-lg'
                                : locked
                                  ? 'cursor-not-allowed border-transparent text-[var(--color-ink)]/30'
                                  : 'border-transparent text-[var(--color-ink)]/60 hover:text-[var(--color-ink)]'
                        }`}
                    >
                        {tab.label}
                        {showErrorDot && (
                            <span
                                title="This tab has validation errors"
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
