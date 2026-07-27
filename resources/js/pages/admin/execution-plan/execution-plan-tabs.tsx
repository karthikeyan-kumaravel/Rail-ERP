export type ExecutionPlanTabKey = 'gantt' | 'checklist' | 'milestones';

type ExecutionPlanTabsProps = {
    active: ExecutionPlanTabKey;
    onChange: (tab: ExecutionPlanTabKey) => void;
};

const tabs: { key: ExecutionPlanTabKey; label: string }[] = [
    { key: 'gantt', label: 'Gantt Chart' },
    { key: 'checklist', label: 'Pre-Start Checklist' },
    { key: 'milestones', label: 'Milestones' },
];

export const EXECUTION_PLAN_TAB_ORDER = tabs.map((tab) => tab.key);

export default function ExecutionPlanTabs({
    active,
    onChange,
}: ExecutionPlanTabsProps) {
    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-[var(--color-gold)]/25">
            {tabs.map((tab) => {
                const isActive = active === tab.key;

                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={`relative -mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                            isActive
                                ? 'border-transparent bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] text-white shadow-lg'
                                : 'border-transparent text-[var(--color-ink)]/60 hover:text-[var(--color-ink)]'
                        }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
