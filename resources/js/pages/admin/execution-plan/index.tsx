import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { RefreshIcon } from '@/lib/icons';
import {
    GANTT_TASKS,
    MILESTONES,
    PHASES,
    PLAN_VS_SCHEDULE_LABEL,
    PRE_START_CHECKLIST,
    PROJECT_INFO,
    SCHEDULE_PROGRESS_PERCENT,
    SCHEDULE_PROGRESS_SUBTITLE,
    TODAY_ELAPSED_MONTHS,
    TOTAL_MONTHS,
} from './execution-plan-mock-data';
import type { ChecklistItem } from './execution-plan-mock-data';
import ExecutionPlanTabs, {
    EXECUTION_PLAN_TAB_ORDER,
} from './execution-plan-tabs';
import type { ExecutionPlanTabKey } from './execution-plan-tabs';
import GanttChartTab from './gantt-chart-tab';
import MilestonesTab from './milestones-tab';
import PreStartChecklistTab from './pre-start-checklist-tab';

type StatTone = 'accent' | 'blue' | 'green' | 'amber' | 'red';

const TONE_STYLES: Record<StatTone, { border: string; bar: string }> = {
    accent: {
        border: 'border-t-[var(--color-accent)]',
        bar: 'bg-[var(--color-accent)]',
    },
    blue: { border: 'border-t-blue-500', bar: 'bg-blue-500' },
    green: { border: 'border-t-green-600', bar: 'bg-green-600' },
    amber: { border: 'border-t-amber-500', bar: 'bg-amber-500' },
    red: { border: 'border-t-red-500', bar: 'bg-red-500' },
};

function SummaryCard({
    label,
    value,
    subtitle,
    tone,
    percent,
}: {
    label: string;
    value: string;
    subtitle?: string;
    tone: StatTone;
    percent?: number;
}) {
    const colors = TONE_STYLES[tone];

    return (
        <div
            className={`rounded-lg border border-t-4 border-[var(--color-gold)]/20 bg-[var(--color-surface)] px-4 py-3 shadow-sm ${colors.border}`}
        >
            <p className="truncate text-[11px] font-semibold tracking-wide text-[var(--color-ink)]/50 uppercase">
                {label}
            </p>
            <p className="mt-1 text-xl font-bold text-[var(--color-ink)]">
                {value}
            </p>
            {typeof percent === 'number' && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
                    <div
                        className={`h-full rounded-full ${colors.bar}`}
                        style={{
                            width: `${Math.min(100, Math.max(0, percent))}%`,
                        }}
                    />
                </div>
            )}
            {subtitle && (
                <p className="mt-2 truncate text-xs text-[var(--color-ink)]/50">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[11px] font-semibold tracking-wide text-[var(--color-ink)]/50 uppercase">
                {label}
            </p>
            <p className="text-sm font-bold text-[var(--color-ink)]">{value}</p>
        </div>
    );
}

const INITIAL_COMPLETED_TASK_IDS = new Set(
    GANTT_TASKS.filter((task) => task.percentComplete === 100).map(
        (task) => task.id,
    ),
);

export default function ExecutionPlanIndex() {
    const [activeTab, setActiveTab] = useState<ExecutionPlanTabKey>(
        EXECUTION_PLAN_TAB_ORDER[0],
    );
    const [checklist, setChecklist] =
        useState<ChecklistItem[]>(PRE_START_CHECKLIST);
    const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(
        INITIAL_COMPLETED_TASK_IDS,
    );

    const toggleChecklistItem = (id: string) => {
        setChecklist((items) =>
            items.map((item) =>
                item.id === id ? { ...item, checked: !item.checked } : item,
            ),
        );
    };

    const toggleTaskComplete = (id: string) => {
        setCompletedTaskIds((ids) => {
            const next = new Set(ids);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const handleReset = () => {
        if (
            !window.confirm(
                'Reset the execution plan view to its default state?',
            )
        ) {
            return;
        }

        setActiveTab(EXECUTION_PLAN_TAB_ORDER[0]);
        setChecklist(PRE_START_CHECKLIST);
        setCompletedTaskIds(INITIAL_COMPLETED_TASK_IDS);
    };

    const totalTasks = GANTT_TASKS.length;
    const tasksDone = completedTaskIds.size;
    const checklistDone = checklist.filter((item) => item.checked).length;

    return (
        <AdminLayout
            title="Execution Plan & Gantt Chart"
            withBackgroundImage
            header={
                <div className="text-sm print:hidden">
                    <span className="text-[var(--color-ink)]/55">
                        Project Setup
                    </span>
                    <span className="mx-1.5 text-[var(--color-ink)]/35">/</span>
                    <span className="font-semibold text-[var(--color-ink)]">
                        Execution Plan & Gantt Chart
                    </span>
                </div>
            }
        >
            <div className="space-y-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                            Execution Plan & Gantt Chart
                        </h1>
                        <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                            Track phases, milestones and pre-start readiness for
                            the project schedule.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm">
                        <InfoItem
                            label="Project No."
                            value={PROJECT_INFO.projectNo}
                        />
                        <span className="hidden h-8 w-px bg-[var(--color-border)] sm:block" />
                        <InfoItem
                            label="Start Date"
                            value={PROJECT_INFO.startDate}
                        />
                        <span className="hidden h-8 w-px bg-[var(--color-border)] sm:block" />
                        <InfoItem
                            label="End Date"
                            value={PROJECT_INFO.endDate}
                        />
                        <span className="hidden h-8 w-px bg-[var(--color-border)] sm:block" />
                        <InfoItem
                            label="Duration"
                            value={PROJECT_INFO.duration}
                        />
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-gold)]/25 px-3 py-2 text-xs font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                        >
                            <RefreshIcon className="h-3.5 w-3.5" />
                            Reset
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <SummaryCard
                        label="Total Tasks"
                        value={`${totalTasks}`}
                        subtitle={`${PHASES.length} phases`}
                        tone="accent"
                    />
                    <SummaryCard
                        label="Tasks Done"
                        value={`${tasksDone}/${totalTasks}`}
                        tone="green"
                        percent={(tasksDone / totalTasks) * 100}
                    />
                    <SummaryCard
                        label="Pre-Start Checklist"
                        value={`${checklistDone}/${checklist.length}`}
                        tone="amber"
                        percent={(checklistDone / checklist.length) * 100}
                    />
                    <SummaryCard
                        label="Schedule Progress"
                        value={`${SCHEDULE_PROGRESS_PERCENT}%`}
                        subtitle={SCHEDULE_PROGRESS_SUBTITLE}
                        tone="blue"
                        percent={SCHEDULE_PROGRESS_PERCENT}
                    />
                    <SummaryCard
                        label="Plan vs Schedule"
                        value={PLAN_VS_SCHEDULE_LABEL}
                        subtitle="vs baseline plan"
                        tone="red"
                    />
                </div>

                <ExecutionPlanTabs active={activeTab} onChange={setActiveTab} />

                <GanttChartTab
                    phases={PHASES}
                    tasks={GANTT_TASKS}
                    totalMonths={TOTAL_MONTHS}
                    todayMonthOffset={TODAY_ELAPSED_MONTHS}
                    completedTaskIds={completedTaskIds}
                    onToggleTask={toggleTaskComplete}
                    className={activeTab === 'gantt' ? '' : 'hidden'}
                />

                <PreStartChecklistTab
                    items={checklist}
                    onToggle={toggleChecklistItem}
                    className={activeTab === 'checklist' ? '' : 'hidden'}
                />

                <MilestonesTab
                    milestones={MILESTONES}
                    phases={PHASES}
                    className={activeTab === 'milestones' ? '' : 'hidden'}
                />
            </div>
        </AdminLayout>
    );
}
