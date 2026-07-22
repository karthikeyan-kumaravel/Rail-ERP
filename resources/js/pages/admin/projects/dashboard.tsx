import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { edit, index } from '@/routes/admin/projects';
import { index as stationsIndex } from '@/routes/admin/stations';

type ProjectInfo = {
    unique_id: string;
    name: string;
    client: string;
    division: string;
    start_date: string | null;
    end_date: string | null;
    pm: string;
    site_engineer: string;
    billing_engineer: string;
    total_stations: number;
    loa_number: string | null;
};

type Metrics = {
    loa_value: number;
    loa_value_unit: string;
    work_completed_pct: number;
    supply_pct: number;
    installation_pct: number;
    billing_pct: number;
    payment_received_pct: number;
    outstanding_amount: number;
    outstanding_unit: string;
    days_remaining: number | null;
    est_profit_pct: number;
};

type BoqItem = {
    name: string;
    supply_pct: number;
    installation_pct: number;
    commissioning_pct: number;
    billed: number;
    billed_unit: string;
    total: number;
    total_unit: string;
    progress_pct: number;
};

type RecentBill = {
    bill_no: string;
    date: string;
    gross: number;
    net_bill: number;
    status: 'Submitted' | 'Passed' | 'Paid';
};

type StationSummary = {
    done: number;
    in_progress: number;
    pending: number;
    total: number;
};

type PaymentSummary = {
    total_billed: number;
    total_billed_unit: string;
    received: number;
    received_unit: string;
    outstanding: number;
    outstanding_unit: string;
    received_pct: number;
};

type ProjectDashboardProps = {
    project: ProjectInfo;
    metrics: Metrics;
    boq_items: BoqItem[];
    recent_bills: RecentBill[];
    station_summary: StationSummary;
    payment_summary: PaymentSummary;
};

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatMoney(value: number, unit: string): string {
    return `₹${value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${unit}`;
}

function formatRupees(value: number): string {
    return `₹${value.toLocaleString('en-IN')}`;
}

const statusStyles: Record<RecentBill['status'], string> = {
    Submitted: 'text-[var(--color-status-gold-text)]',
    Passed: 'text-blue-600',
    Paid: 'text-green-600',
};

function Card({
    title,
    action,
    children,
}: {
    title: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-[var(--color-ink)]">
                    {title}
                </h2>
                {action}
            </div>
            {children}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-gold)]/15 py-2.5 last:border-b-0">
            <span className="text-xs font-medium tracking-wide text-[var(--color-ink)]/55 uppercase">
                {label}
            </span>
            <span className="text-right text-sm font-semibold text-[var(--color-ink)]">
                {value}
            </span>
        </div>
    );
}

type StatColor = 'orange' | 'blue' | 'green' | 'red';

const statColorMap: Record<StatColor, { border: string; bar: string }> = {
    orange: {
        border: 'border-t-[var(--color-accent)]',
        bar: 'bg-[var(--color-accent)]',
    },
    blue: { border: 'border-t-blue-500', bar: 'bg-blue-500' },
    green: { border: 'border-t-green-600', bar: 'bg-green-600' },
    red: { border: 'border-t-red-500', bar: 'bg-red-500' },
};

function StatCard({
    label,
    value,
    subtitle,
    color,
    percent,
}: {
    label: string;
    value: ReactNode;
    subtitle?: string;
    color: StatColor;
    percent?: number;
}) {
    const colors = statColorMap[color];

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

function BoqProgressBar({ item }: { item: BoqItem }) {
    const supplyDone = Math.min(item.progress_pct, item.supply_pct);
    const installationDone = Math.min(
        Math.max(item.progress_pct - item.supply_pct, 0),
        item.installation_pct,
    );
    const commissioningDone = Math.min(
        Math.max(
            item.progress_pct - item.supply_pct - item.installation_pct,
            0,
        ),
        item.commissioning_pct,
    );

    const segments: { weight: number; done: number; color: string }[] = [
        { weight: item.supply_pct, done: supplyDone, color: 'bg-blue-500' },
        {
            weight: item.installation_pct,
            done: installationDone,
            color: 'bg-[var(--color-accent)]',
        },
        {
            weight: item.commissioning_pct,
            done: commissioningDone,
            color: 'bg-green-600',
        },
    ].filter((segment) => segment.weight > 0);

    return (
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
            {segments.map((segment, index) => (
                <div
                    key={index}
                    className="relative h-full bg-[var(--color-surface-soft)]"
                    style={{ width: `${segment.weight}%` }}
                >
                    <div
                        className={`h-full ${segment.color}`}
                        style={{
                            width: `${(segment.done / segment.weight) * 100}%`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

export default function ProjectDashboard({
    project,
    metrics,
    boq_items: boqItems,
    recent_bills: recentBills,
    station_summary: stationSummary,
    payment_summary: paymentSummary,
}: ProjectDashboardProps) {
    const stationsCompletedLabel = `${stationSummary.done}/${stationSummary.total} stations completed`;
    const stationsCompletedPct =
        stationSummary.total > 0
            ? (stationSummary.done / stationSummary.total) * 100
            : 0;

    return (
        <AdminLayout
            title={project.name}
            withBackgroundImage
            header={
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="text-sm">
                        <Link
                            href={index.url()}
                            className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                        >
                            Admin / Project Creation
                        </Link>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            {project.name}
                        </span>
                    </div>
                    <Link
                        href={edit.url(project.unique_id)}
                        className="rounded-lg border border-[var(--color-gold)]/25 px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Edit
                    </Link>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <StatCard
                        label="LOA Value"
                        value={formatMoney(
                            metrics.loa_value,
                            metrics.loa_value_unit,
                        )}
                        subtitle={project.loa_number ?? undefined}
                        color="orange"
                    />
                    <StatCard
                        label="Work Completed"
                        value={`${metrics.work_completed_pct}%`}
                        color="blue"
                        percent={metrics.work_completed_pct}
                    />
                    <StatCard
                        label="Supply %"
                        value={`${metrics.supply_pct}%`}
                        color="blue"
                        percent={metrics.supply_pct}
                    />
                    <StatCard
                        label="Installation %"
                        value={`${metrics.installation_pct}%`}
                        color="orange"
                        percent={metrics.installation_pct}
                    />
                    <StatCard
                        label="Billing %"
                        value={`${metrics.billing_pct}%`}
                        color="green"
                        percent={metrics.billing_pct}
                    />
                    <StatCard
                        label="Payment Rcvd"
                        value={`${metrics.payment_received_pct}%`}
                        color="green"
                        percent={metrics.payment_received_pct}
                    />
                    <StatCard
                        label="Outstanding"
                        value={formatMoney(
                            metrics.outstanding_amount,
                            metrics.outstanding_unit,
                        )}
                        subtitle="Net receivable"
                        color="red"
                    />
                    <StatCard
                        label="Days Remaining"
                        value={metrics.days_remaining ?? '—'}
                        color="blue"
                    />
                    <StatCard
                        label="Est. Profit %"
                        value={`${metrics.est_profit_pct}%`}
                        subtitle="Based on BOQ"
                        color="green"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card title="BOQ Billing Progress">
                            <p className="-mt-3 mb-4 text-xs text-[var(--color-ink)]/50">
                                Auto-calculated from billing patterns &
                                quantities
                            </p>

                            <div className="mb-4 flex items-center gap-4 text-xs font-medium text-[var(--color-ink)]/70">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                                    Supply
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-accent)]" />
                                    Installation
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-green-600" />
                                    Commissioning
                                </span>
                            </div>

                            <div className="space-y-4">
                                {boqItems.map((item) => (
                                    <div key={item.name}>
                                        <div className="mb-1.5 flex items-center justify-between gap-3">
                                            <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
                                                {item.name}
                                                <span className="rounded-full bg-[var(--color-surface-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ink)]/60">
                                                    {[
                                                        item.supply_pct,
                                                        item.installation_pct,
                                                        item.commissioning_pct,
                                                    ]
                                                        .filter(
                                                            (value) =>
                                                                value > 0,
                                                        )
                                                        .join('-')}
                                                </span>
                                            </span>
                                            <span className="shrink-0 text-xs text-[var(--color-ink)]/60">
                                                {formatMoney(
                                                    item.billed,
                                                    item.billed_unit,
                                                )}{' '}
                                                /{' '}
                                                {formatMoney(
                                                    item.total,
                                                    item.total_unit,
                                                )}{' '}
                                                ({item.progress_pct}%)
                                            </span>
                                        </div>
                                        <BoqProgressBar item={item} />
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card
                            title="Recent Bills"
                            action={
                                <Link
                                    href="#"
                                    className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
                                >
                                    View All →
                                </Link>
                            }
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-accent)]/10 text-xs font-semibold tracking-wide text-[var(--color-accent)] uppercase">
                                            <th className="px-3 py-2">
                                                Bill No
                                            </th>
                                            <th className="px-3 py-2">Date</th>
                                            <th className="px-3 py-2 text-right">
                                                Gross
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Net Bill
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBills.map((bill) => (
                                            <tr
                                                key={bill.bill_no}
                                                className="border-b border-[var(--color-gold)]/10 text-[var(--color-ink)]/85 last:border-b-0"
                                            >
                                                <td className="px-3 py-3 font-medium text-blue-600">
                                                    {bill.bill_no}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {formatDate(bill.date)}
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    {formatRupees(bill.gross)}
                                                </td>
                                                <td className="px-3 py-3 text-right font-medium">
                                                    {formatRupees(
                                                        bill.net_bill,
                                                    )}
                                                </td>
                                                <td
                                                    className={`px-3 py-3 text-right font-semibold ${statusStyles[bill.status]}`}
                                                >
                                                    {bill.status}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card
                            title="Project Info"
                            action={
                                <Link
                                    href="#"
                                    className="rounded-lg border border-[var(--color-gold)]/25 px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                                >
                                    LOA →
                                </Link>
                            }
                        >
                            <DetailRow label="Client" value={project.client} />
                            <DetailRow
                                label="Division"
                                value={project.division}
                            />
                            <DetailRow
                                label="Start"
                                value={formatDate(project.start_date)}
                            />
                            <DetailRow
                                label="End Date"
                                value={formatDate(project.end_date)}
                            />
                            <DetailRow label="PM" value={project.pm} />
                            <DetailRow
                                label="Site Engineer"
                                value={project.site_engineer}
                            />
                            <DetailRow
                                label="Billing Eng."
                                value={project.billing_engineer}
                            />
                            <DetailRow
                                label="Stations"
                                value={`${project.total_stations} Stations`}
                            />
                        </Card>

                        <Card
                            title="Station Summary"
                            action={
                                <Link
                                    href={stationsIndex.url()}
                                    className="rounded-lg border border-[var(--color-gold)]/25 px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                                >
                                    View
                                </Link>
                            }
                        >
                            <div className="mb-4 grid grid-cols-3 gap-3">
                                <div className="rounded-lg bg-green-50 py-3 text-center">
                                    <p className="text-xl font-bold text-green-700">
                                        {stationSummary.done}
                                    </p>
                                    <p className="text-xs font-medium text-green-700/70 uppercase">
                                        Done
                                    </p>
                                </div>
                                <div className="rounded-lg bg-[var(--color-status-gold-bg)] py-3 text-center">
                                    <p className="text-xl font-bold text-[var(--color-status-gold-text)]">
                                        {stationSummary.in_progress}
                                    </p>
                                    <p className="text-xs font-medium text-[var(--color-status-gold-text)]/70 uppercase">
                                        In Prog
                                    </p>
                                </div>
                                <div className="rounded-lg bg-[var(--color-surface-soft)] py-3 text-center">
                                    <p className="text-xl font-bold text-[var(--color-ink)]/60">
                                        {stationSummary.pending}
                                    </p>
                                    <p className="text-xs font-medium text-[var(--color-ink)]/50 uppercase">
                                        Pending
                                    </p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
                                <div
                                    className="h-full rounded-full bg-green-600"
                                    style={{
                                        width: `${stationsCompletedPct}%`,
                                    }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-[var(--color-ink)]/50">
                                {stationsCompletedLabel}
                            </p>
                        </Card>

                        <Card title="Payment Summary">
                            <DetailRow
                                label="Total Billed"
                                value={formatMoney(
                                    paymentSummary.total_billed,
                                    paymentSummary.total_billed_unit,
                                )}
                            />
                            <DetailRow
                                label="Received"
                                value={
                                    <span className="text-green-600">
                                        {formatMoney(
                                            paymentSummary.received,
                                            paymentSummary.received_unit,
                                        )}
                                    </span>
                                }
                            />
                            <DetailRow
                                label="Outstanding"
                                value={
                                    <span className="text-red-500">
                                        {formatMoney(
                                            paymentSummary.outstanding,
                                            paymentSummary.outstanding_unit,
                                        )}
                                    </span>
                                }
                            />
                            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-soft)]">
                                <div
                                    className="h-full rounded-full bg-green-600"
                                    style={{
                                        width: `${paymentSummary.received_pct}%`,
                                    }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-[var(--color-ink)]/50">
                                {paymentSummary.received_pct}% received of net
                                bills
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
