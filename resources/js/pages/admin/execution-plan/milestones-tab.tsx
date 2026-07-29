import type { Milestone, Phase } from './execution-plan-mock-data';

const STATUS_BADGE: Record<Milestone['status'], string> = {
    Past: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    'In Progress': 'border-blue-200 bg-blue-50 text-blue-700',
    Upcoming: 'border-slate-200 bg-slate-50 text-slate-600',
    Delayed: 'border-red-200 bg-red-50 text-red-700',
};

type MilestonesTabProps = {
    milestones: Milestone[];
    phases: Phase[];
    className?: string;
};

export default function MilestonesTab({
    milestones,
    phases,
    className = '',
}: MilestonesTabProps) {
    const phaseById = new Map(phases.map((phase) => [phase.id, phase]));

    return (
        <div className={className}>
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                <div className="border-b border-[var(--color-border)] px-4 py-3 sm:px-6">
                    <h2 className="text-base font-bold text-[var(--color-ink)]">
                        Milestones
                    </h2>
                    <p className="text-xs text-[var(--color-ink)]/50">
                        Key delivery milestones across the execution schedule
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-accent)]/10 text-xs font-semibold tracking-wide text-[var(--color-accent)] uppercase">
                                <th className="px-4 py-3">Month</th>
                                <th className="px-4 py-3">Target Date</th>
                                <th className="px-4 py-3">Milestone</th>
                                <th className="px-4 py-3">Phase</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {milestones.map((milestone) => {
                                const phase = phaseById.get(milestone.phaseId);

                                return (
                                    <tr
                                        key={milestone.id}
                                        className="border-b border-[var(--color-gold)]/10 text-[var(--color-ink)]/85 last:border-b-0 hover:bg-[var(--color-surface-soft-2)]"
                                    >
                                        <td className="px-4 py-3 font-semibold whitespace-nowrap text-[var(--color-ink)]">
                                            M{milestone.month}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {milestone.targetDate}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {milestone.milestone}
                                        </td>
                                        <td className="px-4 py-3">
                                            {phase && (
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${phase.badgeClass}`}
                                                >
                                                    {phase.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_BADGE[milestone.status]}`}
                                            >
                                                {milestone.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
