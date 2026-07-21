import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import type { ReactNode } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { edit, index, pdf } from '@/routes/admin/loas';
import {
    bidRateUnitTextClass,
    PAYMENT_STAGE_KEYS,
    PAYMENT_STAGE_SHORT_LABELS,
    PAYMENT_STAGE_TONE_CLASS,
} from './loa-form-fields';
import type { LoaItemFormData } from './loa-form-fields';

type LoaTeamMember = { name: string; role: string };

type LoaShowItem = LoaItemFormData & {
    schedule_name_label: string | null;
    schedule_type_label: string | null;
};

type ScheduleGroup = {
    key: string;
    label: string;
    items: LoaShowItem[];
    totalAdvertisedValue: number;
    totalBidAmount: number;
};

type LoaShow = {
    unique_id: string;
    loa_number: string;
    client: string;
    division: string;
    schedule_name: string | null;
    schedule_type: string | null;
    work_type: string;
    contract_value_amount: number;
    contract_value_unit: 'Cr' | 'L';
    completion_period_months: number;
    defect_liability_months: number;
    start_date: string;
    end_date: string;
    total_stations: number;
    bg_amount: number;
    bg_amount_unit: 'Cr' | 'L';
    bg_validity: string;
    security_deposit_amount: number;
    security_deposit_unit: 'Cr' | 'L';
    mobilization_advance_amount: number;
    mobilization_advance_unit: 'Cr' | 'L';
    mobilization_advance_status: 'Pending' | 'Requested' | 'Received';
    scope_of_work: string;
    active_status: boolean;
    team: LoaTeamMember[];
    items: LoaShowItem[];
    stations: (string | null)[];
};

type ShowProps = {
    loa: LoaShow;
};

function formatDate(value: string | null | undefined): string {
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

function formatCurrency(amount: number, unit: 'Cr' | 'L'): string {
    return `₹${Number(amount).toFixed(2)} ${unit}`;
}

function formatNumber(
    value: number | string,
    maximumFractionDigits = 2,
): string {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return String(value);
    }

    return numericValue.toLocaleString('en-IN', {
        minimumFractionDigits: Math.min(2, maximumFractionDigits),
        maximumFractionDigits,
    });
}

function formatMoney(value: number | string | null): string {
    if (value === null || value === '') {
        return '—';
    }

    return `₹${formatNumber(value)}`;
}

function groupItemsBySchedule(items: LoaShowItem[]): ScheduleGroup[] {
    const groups: ScheduleGroup[] = [];
    const groupsByKey = new Map<string, ScheduleGroup>();

    for (const item of items) {
        const key = `${item.schedule_name_id || 'none'}-${item.schedule_type_id || 'none'}`;
        let group = groupsByKey.get(key);

        if (!group) {
            const label = [item.schedule_name_label, item.schedule_type_label]
                .filter(Boolean)
                .join(' - ');

            group = {
                key,
                label: label !== '' ? label : 'Unassigned Items',
                items: [],
                totalAdvertisedValue: 0,
                totalBidAmount: 0,
            };
            groupsByKey.set(key, group);
            groups.push(group);
        }

        group.items.push(item);
        group.totalAdvertisedValue += Number(item.advertised_value) || 0;
        group.totalBidAmount += Number(item.bid_amount) || 0;
    }

    return groups;
}

function initialsOf(name: string): string {
    return (
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || '?'
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

function PaymentStagesBadges({
    stages,
}: {
    stages: LoaItemFormData['payment_stages'];
}) {
    const configuredKeys = PAYMENT_STAGE_KEYS.filter((key) => stages?.[key]);

    if (configuredKeys.length === 0) {
        return <span className="text-[var(--color-ink)]/55">—</span>;
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {configuredKeys.map((key) => (
                <span
                    key={key}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap ${PAYMENT_STAGE_TONE_CLASS[key]}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {PAYMENT_STAGE_SHORT_LABELS[key]} {stages?.[key]}
                </span>
            ))}
        </div>
    );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 border-b border-[var(--color-gold)]/20 pb-3 text-base font-bold text-[var(--color-ink)]">
                {title}
            </h2>
            {children}
        </div>
    );
}

export default function LoasShow({ loa }: ShowProps) {
    return (
        <AdminLayout
            title="View LOA / PO"
            withBackgroundImage
            header={
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="text-sm">
                        <Link
                            href={index.url()}
                            className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                        >
                            Admin / LOA / PO Management
                        </Link>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            View
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={index.url()}
                            className="rounded-lg border border-[var(--color-gold)]/25 px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                        >
                            Back
                        </Link>
                        <a
                            href={pdf.url(loa.unique_id)}
                            className="rounded-lg border border-[var(--color-gold)]/25 px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                        >
                            Download PDF
                        </a>
                        <Link
                            href={edit.url(loa.unique_id)}
                            className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                        >
                            Edit
                        </Link>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card title="LOA Details">
                        <DetailRow label="LOA Number" value={loa.loa_number} />
                        <DetailRow label="Client" value={loa.client} />
                        <DetailRow
                            label="Division"
                            value={loa.division ?? '—'}
                        />
                        <DetailRow label="Work Type" value={loa.work_type} />
                        <DetailRow
                            label="Contract Value"
                            value={formatCurrency(
                                loa.contract_value_amount,
                                loa.contract_value_unit,
                            )}
                        />
                        <DetailRow
                            label="Completion Period"
                            value={`${loa.completion_period_months} Months`}
                        />
                        <DetailRow
                            label="Defect Liability"
                            value={`${loa.defect_liability_months} Months`}
                        />
                        <DetailRow
                            label="Start Date"
                            value={formatDate(loa.start_date)}
                        />
                        <DetailRow
                            label="End Date"
                            value={formatDate(loa.end_date)}
                        />
                        <DetailRow
                            label="Total Stations"
                            value={`${loa.total_stations} Stations`}
                        />
                        <DetailRow
                            label="Station Names"
                            value={
                                loa.stations.filter(Boolean).length > 0
                                    ? loa.stations.filter(Boolean).join(', ')
                                    : '—'
                            }
                        />
                        <DetailRow
                            label="Status"
                            value={
                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        loa.active_status
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-red-50 text-red-600'
                                    }`}
                                >
                                    {loa.active_status ? 'Active' : 'Inactive'}
                                </span>
                            }
                        />
                    </Card>

                    <div className="space-y-6">
                        <Card title="Financial Security">
                            <DetailRow
                                label="BG Amount"
                                value={formatCurrency(
                                    loa.bg_amount,
                                    loa.bg_amount_unit,
                                )}
                            />
                            <DetailRow
                                label="BG Validity"
                                value={formatDate(loa.bg_validity)}
                            />
                            <DetailRow
                                label="Security Deposit"
                                value={formatCurrency(
                                    loa.security_deposit_amount,
                                    loa.security_deposit_unit,
                                )}
                            />
                            <DetailRow
                                label="Mobilization Advance"
                                value={formatCurrency(
                                    loa.mobilization_advance_amount,
                                    loa.mobilization_advance_unit,
                                )}
                            />
                            <DetailRow
                                label="Mob. Advance Status"
                                value={loa.mobilization_advance_status}
                            />
                        </Card>

                        <Card title="Project Team">
                            {loa.team.length === 0 ? (
                                <p className="text-sm text-[var(--color-ink)]/55">
                                    No team members added.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {loa.team.map((member, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] text-sm font-semibold text-white">
                                                {initialsOf(member.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                                                    {member.name}
                                                </p>
                                                <p className="truncate text-xs text-[var(--color-ink)]/55">
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                <Card title="Scope of Work">
                    <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--color-ink)]/85">
                        {loa.scope_of_work || '—'}
                    </p>
                </Card>

                <Card title="LOA Item Details">
                    {(loa.schedule_name || loa.schedule_type) && (
                        <div className="mb-4 rounded-lg border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)]">
                            {[loa.schedule_name, loa.schedule_type]
                                .filter(Boolean)
                                .join('-')}
                        </div>
                    )}
                    {loa.items.length === 0 ? (
                        <p className="text-sm text-[var(--color-ink)]/55">
                            No item details added.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-[var(--color-gold)]/25">
                            <table className="w-full min-w-[1500px] text-left text-xs">
                                <thead className="bg-[var(--color-ink)] text-white">
                                    <tr>
                                        <th className="px-3 py-3">
                                            Item S.no
                                        </th>
                                        <th className="min-w-64 px-3 py-3">
                                            Item Desc
                                        </th>
                                        <th className="px-3 py-3">
                                            Item Code
                                        </th>
                                        <th className="px-3 py-3 text-right">
                                            Item Qty
                                        </th>
                                        <th className="px-3 py-3">
                                            Qty Unit
                                        </th>
                                        <th className="px-3 py-3 text-right">
                                            Unit Rate (Rs)
                                        </th>
                                        <th className="px-3 py-3">Escl. (%)</th>
                                        <th className="px-3 py-3 text-right">
                                            Advt. Value (Rs)
                                        </th>
                                        <th className="px-3 py-3 text-right">
                                            Bid Rate/ Unit Rate
                                        </th>
                                        <th className="px-3 py-3 text-right">
                                            Bid Amount (Rs)
                                        </th>
                                        <th className="px-3 py-3">
                                            Inspection By
                                        </th>
                                        <th className="min-w-64 px-3 py-3">
                                            Payment Type
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupItemsBySchedule(loa.items).map(
                                        (group) => (
                                            <Fragment key={group.key}>
                                                <tr className="border-t border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] font-semibold text-[var(--color-ink)]">
                                                    <td
                                                        colSpan={7}
                                                        className="px-3 py-2.5"
                                                    >
                                                        Schedule {group.label}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right">
                                                        {formatMoney(
                                                            group.totalAdvertisedValue,
                                                        )}
                                                    </td>
                                                    <td />
                                                    <td className="px-3 py-2.5 text-right">
                                                        {formatMoney(
                                                            group.totalBidAmount,
                                                        )}
                                                    </td>
                                                    <td colSpan={2} />
                                                </tr>
                                                {group.items.map(
                                                    (item, index) => (
                                                        <tr
                                                            key={`${group.key}-${index}`}
                                                            className="border-t border-[var(--color-gold)]/15 align-top text-[var(--color-ink)]/85 even:bg-[var(--color-surface-soft)]/25"
                                                        >
                                                            <td className="px-3 py-3">
                                                                {index + 1}
                                                            </td>
                                                            <td className="max-w-96 px-3 py-3 whitespace-pre-wrap">
                                                                {
                                                                    item.item_description
                                                                }
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                {item.item_code ??
                                                                    '—'}
                                                            </td>
                                                            <td className="px-3 py-3 text-right">
                                                                {formatNumber(
                                                                    item.item_quantity,
                                                                    3,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                {
                                                                    item.quantity_unit
                                                                }
                                                            </td>
                                                            <td className="px-3 py-3 text-right">
                                                                {formatMoney(
                                                                    item.unit_rate,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 text-right">
                                                                {item.escalation !==
                                                                    null &&
                                                                item.escalation !==
                                                                    ''
                                                                    ? `${formatNumber(item.escalation)}%`
                                                                    : '—'}
                                                            </td>
                                                            <td className="px-3 py-3 text-right">
                                                                {formatMoney(
                                                                    item.advertised_value,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 text-right">
                                                                <p>
                                                                    {formatMoney(
                                                                        item.bid_rate,
                                                                    )}
                                                                </p>
                                                                {item.bid_rate_unit && (
                                                                    <p
                                                                        className={`text-[0.7rem] font-medium whitespace-nowrap ${bidRateUnitTextClass(item.bid_rate_unit)}`}
                                                                    >
                                                                        {formatNumber(
                                                                            item.bid_percentage_value ??
                                                                                0,
                                                                            4,
                                                                        )}
                                                                        {
                                                                            item.bid_rate_unit
                                                                        }
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 text-right">
                                                                {formatMoney(
                                                                    item.bid_amount,
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                {item.inspection_by ??
                                                                    '—'}
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <PaymentStagesBadges
                                                                    stages={
                                                                        item.payment_stages
                                                                    }
                                                                />
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                                <tr className="border-t border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)]/70 font-semibold text-[var(--color-ink)]">
                                                    <td
                                                        colSpan={7}
                                                        className="px-3 py-2.5"
                                                    >
                                                        Schedule Totals
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right">
                                                        {formatMoney(
                                                            group.totalAdvertisedValue,
                                                        )}
                                                    </td>
                                                    <td />
                                                    <td className="px-3 py-2.5 text-right">
                                                        {formatMoney(
                                                            group.totalBidAmount,
                                                        )}
                                                    </td>
                                                    <td colSpan={2} />
                                                </tr>
                                            </Fragment>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
