import { Link, router, usePage } from '@inertiajs/react';
import type { MouseEvent } from 'react';
import { useEffect, useId, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { EyeIcon, PencilIcon, TrashIcon } from '@/lib/icons';
import { PaginationFooter, PerPageSelect } from '@/lib/table-pagination';
import type { PerPageValue } from '@/lib/table-pagination';
import {
    create,
    destroy,
    edit,
    index as purchaseOrdersIndex,
} from '@/routes/admin/purchase-orders';

type InspectionStatus = 'pending' | 'in_progress' | 'passed' | 'failed';
type DispatchStatus = 'pending' | 'partial' | 'completed';

type PurchaseOrder = {
    unique_id: string;
    po_number: string;
    supplier: string;
    items_description: string;
    order_date: string;
    amount: number | string;
    delivery_date: string;
    payment_terms: string;
    total_qty: number;
    received_qty: number;
    inspection_status: InspectionStatus;
    dispatch_status: DispatchStatus;
    created_at?: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type PurchaseOrderStats = {
    total_pos: number;
    total_value: number | string;
    completed: number;
    pending: number;
};

type Filters = {
    search: string;
    sort: string;
    direction: 'asc' | 'desc';
    per_page: PerPageValue;
};

type PurchaseOrdersIndexProps = {
    purchaseOrders: Paginated<PurchaseOrder>;
    stats: PurchaseOrderStats;
    filters: Filters;
};

function numberValue(value: number | string): number {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
}

function formatCompactInr(value: number | string): string {
    const amount = numberValue(value);
    const absoluteAmount = Math.abs(amount);

    if (absoluteAmount >= 10_000_000) {
        return `₹${(amount / 10_000_000).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} Cr`;
    }

    if (absoluteAmount >= 100_000) {
        return `₹${(amount / 100_000).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} L`;
    }

    return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function statusLabel(status: string): string {
    return status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function statusBadgeClass(status: string): string {
    switch (status) {
        case 'passed':
        case 'completed':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'in_progress':
        case 'partial':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'failed':
            return 'border-red-200 bg-red-50 text-red-700';
        default:
            return 'border-slate-200 bg-slate-50 text-slate-600';
    }
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-bold tracking-wider text-[var(--color-ink)]/50 uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">
                {value}
            </p>
        </div>
    );
}

type PurchaseOrderViewModalProps = {
    order: PurchaseOrder;
    onClose: () => void;
};

function PurchaseOrderViewModal({
    order,
    onClose,
}: PurchaseOrderViewModalProps) {
    const titleId = useId();

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-[var(--color-ink)]/55 p-4 backdrop-blur-[2px]"
            onMouseDown={handleBackdropClick}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--color-surface)]/60 bg-[var(--color-surface)] shadow-[0_24px_70px_rgba(15,36,54,0.28)]"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[var(--color-border-softer)] px-5 py-4 sm:px-6">
                    <h2
                        id={titleId}
                        className="text-lg font-bold text-[var(--color-ink)]"
                    >
                        Purchase Order Details
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close purchase order dialog"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink)]/45 transition hover:bg-red-50 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-6 w-6"
                            aria-hidden="true"
                        >
                            <path d="m6 6 12 12M18 6 6 18" />
                        </svg>
                    </button>
                </div>

                <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
                    <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
                        <DetailRow label="PO Number" value={order.po_number} />
                        <DetailRow
                            label="OEM / Supplier"
                            value={order.supplier}
                        />
                        <div className="sm:col-span-2">
                            <DetailRow
                                label="Items Description"
                                value={order.items_description}
                            />
                        </div>
                        <DetailRow
                            label="Order Date"
                            value={order.order_date}
                        />
                        <DetailRow
                            label="Amount"
                            value={formatCompactInr(order.amount)}
                        />
                        <DetailRow
                            label="Delivery Date"
                            value={order.delivery_date}
                        />
                        <DetailRow
                            label="Payment Terms"
                            value={order.payment_terms}
                        />
                        <DetailRow
                            label="Total Qty"
                            value={String(order.total_qty)}
                        />
                        <DetailRow
                            label="Received Qty"
                            value={String(order.received_qty)}
                        />
                        <DetailRow
                            label="Inspection"
                            value={statusLabel(order.inspection_status)}
                        />
                        <DetailRow
                            label="Dispatch"
                            value={statusLabel(order.dispatch_status)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border-softer)] bg-[var(--color-bg-soft-3)] px-5 py-3.5 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/75 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30 focus-visible:outline-none"
                    >
                        Close
                    </button>
                    <Link
                        href={edit.url(order.unique_id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/40 focus-visible:outline-none"
                    >
                        <PencilIcon />
                        Edit PO
                    </Link>
                </div>
            </section>
        </div>
    );
}

const sortableColumns: { key: string; label: string }[] = [
    { key: 'po_number', label: 'PO No' },
    { key: 'supplier', label: 'OEM / Supplier' },
    { key: 'order_date', label: 'Order Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'delivery_date', label: 'Delivery' },
];

export default function PurchaseOrdersIndex({
    purchaseOrders,
    stats,
    filters,
}: PurchaseOrdersIndexProps) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [listLoading, setListLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(
        null,
    );

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setListLoading(true);
            router.get(
                purchaseOrdersIndex.url(),
                { ...filters, search, page: 1 },
                {
                    preserveState: true,
                    replace: true,
                    onFinish: () => setListLoading(false),
                },
            );
        }, 350);

        return () => window.clearTimeout(timeout);
        // filters intentionally come from the latest Inertia response.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const applySort = (column: string) => {
        const direction =
            filters.sort === column && filters.direction === 'asc'
                ? 'desc'
                : 'asc';

        setListLoading(true);
        router.get(
            purchaseOrdersIndex.url(),
            { ...filters, sort: column, direction },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setListLoading(false),
            },
        );
    };

    const applyPerPage = (perPage: PerPageValue) => {
        setListLoading(true);
        router.get(
            purchaseOrdersIndex.url(),
            { ...filters, per_page: perPage, page: 1 },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setListLoading(false),
            },
        );
    };

    const handleDelete = (order: PurchaseOrder) => {
        if (
            !window.confirm(
                `Delete purchase order ${order.po_number}? This action cannot be undone.`,
            )
        ) {
            return;
        }

        setDeletingId(order.unique_id);
        router.delete(destroy.url(order.unique_id), {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '↕';
        }

        return filters.direction === 'asc' ? '↑' : '↓';
    };

    const summaryCards = [
        {
            label: 'Total POs',
            value: stats.total_pos.toLocaleString('en-IN'),
            accent: 'bg-blue-600',
            iconBackground: 'bg-blue-50 text-blue-600',
            icon: <path d="M7 3h8l4 4v14H5V3h2Zm7 1v4h4M8 12h8M8 16h8" />,
        },
        {
            label: 'Total Value',
            value: formatCompactInr(stats.total_value),
            accent: 'bg-violet-600',
            iconBackground: 'bg-violet-50 text-violet-600',
            icon: <path d="M7 5h10M7 9h10M9 5c4 0 4 6 0 6h-2l8 8M7 13h4" />,
        },
        {
            label: 'Completed',
            value: stats.completed.toLocaleString('en-IN'),
            accent: 'bg-emerald-600',
            iconBackground: 'bg-emerald-50 text-emerald-600',
            icon: <path d="m5 12 4 4L19 6" />,
        },
        {
            label: 'Pending',
            value: stats.pending.toLocaleString('en-IN'),
            accent: 'bg-amber-500',
            iconBackground: 'bg-amber-50 text-amber-600',
            icon: (
                <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v6l4 2" />
                </>
            ),
        },
    ];

    return (
        <AdminLayout
            title="Purchase Orders"
            withBackgroundImage
            header={
                <div className="text-sm print:hidden">
                    <span className="text-[var(--color-ink)]/55">
                        Project Setup
                    </span>
                    <span className="mx-1.5 text-[var(--color-ink)]/35">/</span>
                    <span className="font-semibold text-[var(--color-ink)]">
                        Purchase Orders
                    </span>
                </div>
            }
        >
            <div className="space-y-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                            Purchase Orders
                        </h1>
                        <p className="mt-1 text-sm text-[var(--color-ink)]/60">
                            Track all purchase order delivery and inspection
                            activity.
                        </p>
                    </div>
                    <Link
                        href={create.url()}
                        className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/40 focus-visible:outline-none"
                    >
                        <span className="text-lg leading-none">+</span>
                        New PO
                    </Link>
                </div>

                {(flash.success || flash.error) && (
                    <div
                        role="status"
                        className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${
                            flash.success
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-red-200 bg-red-50 text-red-700'
                        }`}
                    >
                        {flash.success ?? flash.error}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div
                            key={card.label}
                            className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-5 shadow-md backdrop-blur-sm"
                        >
                            <span
                                aria-hidden="true"
                                className={`absolute inset-x-0 top-0 h-1 ${card.accent}`}
                            />
                            <div className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold tracking-wider text-[var(--color-ink)]/55 uppercase">
                                        {card.label}
                                    </p>
                                    <p className="mt-2 truncate text-2xl font-extrabold text-[var(--color-ink)]">
                                        {card.value}
                                    </p>
                                </div>
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBackground}`}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    >
                                        {card.icon}
                                    </svg>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 shadow-xl backdrop-blur-sm">
                    <div className="flex flex-col gap-3 border-b border-[var(--color-border-softer)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <PerPageSelect
                            value={filters.per_page}
                            onChange={applyPerPage}
                        />
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                            {listLoading && (
                                <span className="hidden items-center gap-1.5 text-xs text-[var(--color-ink)]/50 sm:inline-flex">
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--color-accent-2)]/25 border-t-[var(--color-accent-2)]" />
                                    Updating
                                </span>
                            )}
                            <label
                                htmlFor="purchase-order-search"
                                className="sr-only"
                            >
                                Search purchase orders
                            </label>
                            <div className="relative w-full sm:w-72">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-ink)]/35"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-4-4" />
                                </svg>
                                <input
                                    id="purchase-order-search"
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search PO, supplier or items..."
                                    className="w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-soft-2)] py-2 pr-3 pl-9 text-sm text-[var(--color-ink)] transition outline-none placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-x-auto">
                        {listLoading && (
                            <div className="pointer-events-none absolute inset-0 z-10 bg-[var(--color-surface)]/35 backdrop-blur-[1px]" />
                        )}
                        <table className="w-full min-w-360 text-left text-sm">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] bg-[var(--color-accent)]/10 text-[11px] tracking-wider text-[var(--color-accent)] uppercase">
                                    {sortableColumns
                                        .slice(0, 2)
                                        .map((column) => (
                                            <th
                                                key={column.key}
                                                className="px-4 py-3"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        applySort(column.key)
                                                    }
                                                    className="inline-flex items-center gap-1 font-bold transition hover:text-[var(--color-accent)]"
                                                >
                                                    {column.label}
                                                    <span aria-hidden="true">
                                                        {sortIndicator(
                                                            column.key,
                                                        )}
                                                    </span>
                                                </button>
                                            </th>
                                        ))}
                                    <th className="px-4 py-3 font-bold">
                                        Items
                                    </th>
                                    {sortableColumns.slice(2).map((column) => (
                                        <th
                                            key={column.key}
                                            className="px-4 py-3"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    applySort(column.key)
                                                }
                                                className="inline-flex items-center gap-1 font-bold transition hover:text-[var(--color-accent)]"
                                            >
                                                {column.label}
                                                <span aria-hidden="true">
                                                    {sortIndicator(column.key)}
                                                </span>
                                            </button>
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 font-bold">
                                        Pay Terms
                                    </th>
                                    <th className="px-4 py-3 font-bold">
                                        Inspection
                                    </th>
                                    <th className="px-4 py-3 font-bold">
                                        Dispatch
                                    </th>
                                    <th className="px-4 py-3 text-center font-bold">
                                        Rcvd/Total
                                    </th>
                                    <th className="px-4 py-3 text-right font-bold print:hidden">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrders.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-soft)] text-[var(--color-accent-2)]">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.7"
                                                    className="h-6 w-6"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M7 3h8l4 4v14H5V3h2Zm7 1v4h4M8 12h8M8 16h5" />
                                                </svg>
                                            </div>
                                            <p className="mt-3 font-semibold text-[var(--color-ink)]">
                                                No purchase orders found
                                            </p>
                                            <p className="mt-1 text-sm text-[var(--color-ink)]/50">
                                                {filters.search
                                                    ? 'Try a different search term.'
                                                    : 'Create your first purchase order to get started.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    purchaseOrders.data.map((order) => (
                                        <tr
                                            key={order.unique_id}
                                            className="border-b border-[var(--color-border-soft-2)] text-[var(--color-ink)]/80 transition last:border-b-0 hover:bg-[var(--color-surface-soft-2)]"
                                        >
                                            <td className="px-4 py-3.5 font-bold whitespace-nowrap text-[var(--color-ink)]">
                                                {order.po_number}
                                            </td>
                                            <td className="max-w-52 px-4 py-3.5">
                                                <span
                                                    className="block truncate"
                                                    title={order.supplier}
                                                >
                                                    {order.supplier}
                                                </span>
                                            </td>
                                            <td className="max-w-64 px-4 py-3.5">
                                                <span
                                                    className="block truncate"
                                                    title={
                                                        order.items_description
                                                    }
                                                >
                                                    {order.items_description}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap tabular-nums">
                                                {order.order_date}
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold whitespace-nowrap text-[var(--color-ink)] tabular-nums">
                                                {formatCompactInr(order.amount)}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap tabular-nums">
                                                {order.delivery_date}
                                            </td>
                                            <td className="max-w-44 px-4 py-3.5">
                                                <span
                                                    className="block truncate"
                                                    title={order.payment_terms}
                                                >
                                                    {order.payment_terms}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(order.inspection_status)}`}
                                                >
                                                    {statusLabel(
                                                        order.inspection_status,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(order.dispatch_status)}`}
                                                >
                                                    {statusLabel(
                                                        order.dispatch_status,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center font-medium whitespace-nowrap tabular-nums">
                                                <span className="text-[var(--color-ink)]">
                                                    {order.received_qty}
                                                </span>
                                                <span className="mx-1.5 text-[var(--color-ink)]/30">
                                                    /
                                                </span>
                                                {order.total_qty}
                                            </td>
                                            <td className="px-4 py-3.5 print:hidden">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setViewingOrder(
                                                                order,
                                                            )
                                                        }
                                                        title="View"
                                                        aria-label={`View ${order.po_number}`}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-[var(--color-ink)] focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
                                                    >
                                                        <EyeIcon />
                                                    </button>
                                                    <Link
                                                        href={edit.url(
                                                            order.unique_id,
                                                        )}
                                                        title="Edit"
                                                        aria-label={`Edit ${order.po_number}`}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-status-gold-icon)] transition hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30 focus-visible:outline-none"
                                                    >
                                                        <PencilIcon />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(order)
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            order.unique_id
                                                        }
                                                        title="Delete"
                                                        aria-label={`Delete ${order.po_number}`}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none disabled:cursor-wait disabled:opacity-45"
                                                    >
                                                        {deletingId ===
                                                        order.unique_id ? (
                                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
                                                        ) : (
                                                            <TrashIcon />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-[var(--color-border-softer)] px-4 pb-4">
                        <PaginationFooter
                            from={purchaseOrders.from}
                            to={purchaseOrders.to}
                            total={purchaseOrders.total}
                            links={purchaseOrders.links}
                        />
                    </div>
                </section>
            </div>

            {viewingOrder && (
                <PurchaseOrderViewModal
                    order={viewingOrder}
                    onClose={() => setViewingOrder(null)}
                />
            )}
        </AdminLayout>
    );
}
