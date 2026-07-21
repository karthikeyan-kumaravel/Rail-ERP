export type EngineerTabKey =
    | 'personal'
    | 'contact'
    | 'identity'
    | 'employment'
    | 'banking'
    | 'statutory'
    | 'additional';

type EngineerTabsProps = {
    active: EngineerTabKey;
    onChange: (tab: EngineerTabKey) => void;
    hasError: (tab: EngineerTabKey) => boolean;
    isLocked: (tab: EngineerTabKey) => boolean;
};

const tabs: { key: EngineerTabKey; label: string }[] = [
    { key: 'personal', label: 'Personal Information' },
    { key: 'contact', label: 'Contact Information' },
    { key: 'identity', label: 'Government Identity' },
    { key: 'employment', label: 'Employment Details' },
    { key: 'banking', label: 'Banking Details' },
    { key: 'statutory', label: 'Statutory Information' },
    { key: 'additional', label: 'Additional Information' },
];

export const ENGINEER_TAB_ORDER = tabs.map((tab) => tab.key);

export default function EngineerTabs({
    active,
    onChange,
    hasError,
    isLocked,
}: EngineerTabsProps) {
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
