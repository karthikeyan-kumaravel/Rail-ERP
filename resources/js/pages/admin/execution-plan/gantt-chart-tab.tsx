import { CheckIcon } from '@/lib/icons';
import type { GanttTask, Phase } from './execution-plan-mock-data';

const TASK_COL_WIDTH = 240;
const MONTH_WIDTH = 56;

type GanttChartTabProps = {
    phases: Phase[];
    tasks: GanttTask[];
    totalMonths: number;
    todayMonthOffset: number;
    completedTaskIds: Set<string>;
    onToggleTask: (id: string) => void;
    className?: string;
};

function monthsToPx(months: number): number {
    return months * MONTH_WIDTH;
}

function TimelineBackdrop({
    totalMonths,
    todayLeft,
}: {
    totalMonths: number;
    todayLeft: number;
}) {
    return (
        <>
            <div className="absolute inset-0 flex">
                {Array.from({ length: totalMonths }, (_, index) => (
                    <div
                        key={index}
                        className={`h-full border-r border-[var(--color-border)]/50 last:border-r-0 ${
                            index % 2 === 0
                                ? 'bg-[var(--color-surface-soft)]/50'
                                : ''
                        }`}
                        style={{ width: MONTH_WIDTH }}
                    />
                ))}
            </div>
            <div
                className="absolute inset-y-0 border-l-2 border-dashed border-red-400"
                style={{ left: todayLeft }}
            />
        </>
    );
}

export default function GanttChartTab({
    phases,
    tasks,
    totalMonths,
    todayMonthOffset,
    completedTaskIds,
    onToggleTask,
    className = '',
}: GanttChartTabProps) {
    const timelineWidth = monthsToPx(totalMonths);
    const contentWidth = TASK_COL_WIDTH + timelineWidth;
    const todayLeft = monthsToPx(todayMonthOffset - 1);

    return (
        <div className={className}>
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:px-6">
                    <div>
                        <h2 className="text-base font-bold text-[var(--color-ink)]">
                            Project Timeline
                        </h2>
                        <p className="text-xs text-[var(--color-ink)]/50">
                            {totalMonths}-month execution schedule, grouped by
                            phase
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {phases.map((phase) => (
                            <span
                                key={phase.id}
                                className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink)]/70"
                            >
                                <span
                                    className={`h-2.5 w-2.5 rounded-sm ${phase.barClass}`}
                                />
                                {phase.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="overflow-auto" style={{ maxHeight: '30rem' }}>
                    <div style={{ width: contentWidth }}>
                        <div className="flex">
                            <div
                                className="sticky top-0 left-0 z-30 shrink-0 border-r border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-bold tracking-wide text-[var(--color-ink)]/55 uppercase"
                                style={{ width: TASK_COL_WIDTH }}
                            >
                                Task
                            </div>
                            <div className="sticky top-0 z-30 flex bg-[var(--color-surface)]">
                                {Array.from(
                                    { length: totalMonths },
                                    (_, index) => index + 1,
                                ).map((month) => (
                                    <div
                                        key={month}
                                        className="flex shrink-0 items-center justify-center border-r border-b border-[var(--color-border)]/60 py-2 text-[11px] font-semibold text-[var(--color-ink)]/50"
                                        style={{ width: MONTH_WIDTH }}
                                    >
                                        M{month}
                                    </div>
                                ))}
                                <span
                                    className="pointer-events-none absolute -top-2 z-30 -translate-x-1/2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-white shadow"
                                    style={{ left: todayLeft }}
                                >
                                    Today
                                </span>
                            </div>
                        </div>

                        <div>
                            {phases.map((phase) => {
                                const phaseTasks = tasks.filter(
                                    (task) => task.phaseId === phase.id,
                                );

                                if (phaseTasks.length === 0) {
                                    return null;
                                }

                                return (
                                    <div key={phase.id}>
                                        <div className="flex items-stretch border-b border-[var(--color-border)] bg-[var(--color-surface-soft)]/70">
                                            <div
                                                className="sticky left-0 z-20 flex shrink-0 items-center gap-2 bg-[var(--color-surface-soft)] px-3 py-1.5 text-xs font-bold tracking-wide text-[var(--color-ink)]/70 uppercase"
                                                style={{
                                                    width: TASK_COL_WIDTH,
                                                }}
                                            >
                                                <span
                                                    className={`h-2 w-2 shrink-0 rounded-full ${phase.barClass}`}
                                                />
                                                <span className="truncate">
                                                    {phase.name}
                                                </span>
                                            </div>
                                            <div
                                                className="relative shrink-0"
                                                style={{
                                                    width: timelineWidth,
                                                }}
                                            >
                                                <TimelineBackdrop
                                                    totalMonths={totalMonths}
                                                    todayLeft={todayLeft}
                                                />
                                            </div>
                                        </div>

                                        {phaseTasks.map((task) => {
                                            const isDone = completedTaskIds.has(
                                                task.id,
                                            );
                                            const displayPercent = isDone
                                                ? 100
                                                : task.percentComplete;

                                            return (
                                                <div
                                                    key={task.id}
                                                    className="flex items-stretch border-b border-[var(--color-border)]/60 hover:bg-[var(--color-surface-soft-2)]"
                                                >
                                                    <div
                                                        className="sticky left-0 z-20 flex shrink-0 items-center gap-2 bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-ink)]"
                                                        style={{
                                                            width: TASK_COL_WIDTH,
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            aria-pressed={
                                                                isDone
                                                            }
                                                            aria-label={`Mark "${task.name}" as ${isDone ? 'incomplete' : 'complete'}`}
                                                            onClick={() =>
                                                                onToggleTask(
                                                                    task.id,
                                                                )
                                                            }
                                                            className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border-2 transition ${
                                                                isDone
                                                                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                                                                    : 'border-[var(--color-gold)]/40 text-transparent'
                                                            }`}
                                                        >
                                                            <CheckIcon className="h-3 w-3" />
                                                        </button>
                                                        <span
                                                            className={`truncate ${isDone ? 'text-[var(--color-ink)]/50 line-through' : ''}`}
                                                            title={task.name}
                                                        >
                                                            {task.name}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="relative shrink-0"
                                                        style={{
                                                            width: timelineWidth,
                                                            minHeight: 48,
                                                        }}
                                                    >
                                                        <TimelineBackdrop
                                                            totalMonths={
                                                                totalMonths
                                                            }
                                                            todayLeft={
                                                                todayLeft
                                                            }
                                                        />
                                                        <div
                                                            className="absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-2"
                                                            style={{
                                                                left: monthsToPx(
                                                                    task.startMonth -
                                                                        1,
                                                                ),
                                                                width: monthsToPx(
                                                                    task.durationMonths,
                                                                ),
                                                            }}
                                                        >
                                                            <div
                                                                className={`relative h-5 flex-1 overflow-hidden rounded-md shadow-sm ${phase.barClass}`}
                                                            >
                                                                <div
                                                                    className="absolute inset-y-0 right-0 bg-white/45"
                                                                    style={{
                                                                        width: `${100 - displayPercent}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="shrink-0 text-[11px] font-medium whitespace-nowrap text-[var(--color-ink)]/55">
                                                                {
                                                                    task.durationMonths
                                                                }{' '}
                                                                mo
                                                                {displayPercent >
                                                                    0 &&
                                                                    ` · ${displayPercent}%`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
