import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import ExportToolbar from '@/lib/export-toolbar';
import { DocumentIcon, EyeIcon, PencilIcon, TrashIcon } from '@/lib/icons';
import { PaginationFooter, PerPageSelect } from '@/lib/table-pagination';
import type { PerPageValue } from '@/lib/table-pagination';
import { create, destroy, edit, index, pdf, show } from '@/routes/admin/loas';

type LoaRow = {
    unique_id: string;
    loa_number: string;
    client: string;
    division: string | null;
    work_type: string;
    contract_value_amount: number;
    contract_value_unit: 'Cr' | 'L';
    start_date: string;
    end_date: string;
    created_at: string | null;
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

type Filters = {
    search: string;
    sort: string;
    direction: 'asc' | 'desc';
    per_page: PerPageValue;
};

type LoasIndexProps = {
    loas: Paginated<LoaRow>;
    filters: Filters;
};

function formatContractValue(amount: number, unit: 'Cr' | 'L'): string {
    return `₹${Number(amount).toFixed(2)} ${unit}`;
}

export default function LoasIndex({ loas, filters }: LoasIndexProps) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                index.url(),
                { ...filters, search, page: 1 },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const applySort = (column: string) => {
        const direction =
            filters.sort === column && filters.direction === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            index.url(),
            { ...filters, sort: column, direction },
            { preserveState: true, replace: true },
        );
    };

    const applyPerPage = (perPage: PerPageValue) => {
        router.get(
            index.url(),
            { ...filters, per_page: perPage, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (loa: LoaRow) => {
        if (
            window.confirm(
                `Delete ${loa.loa_number}? This action cannot be undone.`,
            )
        ) {
            router.delete(destroy.url(loa.unique_id));
        }
    };

    const exportHeaders = [
        'S.No',
        'LOA Number',
        'Client',
        'Division',
        'Work Type',
        'Contract Value',
        'End Date',
    ];

    const exportRows = loas.data.map((loa, i) => [
        String((loas.from ?? 1) + i),
        loa.loa_number,
        loa.client,
        loa.division ?? '',
        loa.work_type,
        formatContractValue(loa.contract_value_amount, loa.contract_value_unit),
        loa.end_date,
    ]);

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '-';
        }

        return filters.direction === 'asc' ? '^' : 'v';
    };

    return (
        <AdminLayout
            title="LOA / PO Management"
            withBackgroundImage
            header={
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="text-sm">
                        <span className="text-[var(--color-ink)]/55">
                            Admin
                        </span>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            LOA / PO Management
                        </span>
                    </div>
                    <Link
                        href={create.url()}
                        className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                    >
                        + Add New
                    </Link>
                </div>
            }
        >
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6">
                {flash.success && (
                    <div className="mb-4 rounded-lg border border-[var(--color-accent-2)]/30 bg-[var(--color-accent-2)]/10 px-4 py-2 text-sm text-[var(--color-ink)]">
                        {flash.success}
                    </div>
                )}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="flex flex-wrap items-center gap-3">
                        <PerPageSelect
                            value={filters.per_page}
                            onChange={applyPerPage}
                        />

                        <ExportToolbar
                            headers={exportHeaders}
                            rows={exportRows}
                            filename="loas.csv"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--color-ink)]/70">
                            Search:
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-ink)] transition outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)] text-xs font-semibold tracking-wide text-[var(--color-ink)]/60 uppercase">
                                <th className="px-3 py-3">S.No</th>
                                <th
                                    className="cursor-pointer px-3 py-3 select-none"
                                    onClick={() => applySort('loa_number')}
                                >
                                    LOA Number{' '}
                                    <span className="text-[var(--color-ink)]/40">
                                        {sortIndicator('loa_number')}
                                    </span>
                                </th>
                                <th className="px-3 py-3">Client</th>
                                <th className="px-3 py-3">Division</th>
                                <th className="px-3 py-3">Work Type</th>
                                <th className="px-3 py-3">Contract Value</th>
                                <th
                                    className="cursor-pointer px-3 py-3 select-none"
                                    onClick={() => applySort('end_date')}
                                >
                                    End Date{' '}
                                    <span className="text-[var(--color-ink)]/40">
                                        {sortIndicator('end_date')}
                                    </span>
                                </th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loas.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-3 py-6 text-center text-[var(--color-ink)]/55"
                                    >
                                        No LOA / PO records found.
                                    </td>
                                </tr>
                            )}
                            {loas.data.map((loa, i) => (
                                <tr
                                    key={loa.unique_id}
                                    className="border-b border-[var(--color-border-softer)] text-[var(--color-ink)]/85 transition-colors hover:bg-[var(--color-bg-soft)]"
                                >
                                    <td className="px-3 py-3">
                                        {(loas.from ?? 1) + i}
                                    </td>
                                    <td className="px-3 py-3">
                                        {loa.loa_number}
                                    </td>
                                    <td className="px-3 py-3">{loa.client}</td>
                                    <td className="px-3 py-3">
                                        {loa.division ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {loa.work_type}
                                    </td>
                                    <td className="px-3 py-3">
                                        {formatContractValue(
                                            loa.contract_value_amount,
                                            loa.contract_value_unit,
                                        )}
                                    </td>
                                    <td className="px-3 py-3">
                                        {loa.end_date}
                                    </td>
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={show.url(loa.unique_id)}
                                                title="View"
                                                aria-label={`View ${loa.loa_number}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition hover:bg-[var(--color-ink)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                            >
                                                <EyeIcon />
                                            </Link>
                                            <Link
                                                href={edit.url(loa.unique_id)}
                                                title="Edit"
                                                aria-label={`Edit ${loa.loa_number}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                            >
                                                <PencilIcon />
                                            </Link>
                                            <a
                                                href={pdf.url(loa.unique_id)}
                                                title="Download PDF"
                                                aria-label={`Download PDF for ${loa.loa_number}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-ink)]/60 transition hover:bg-[var(--color-ink)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                            >
                                                <DocumentIcon />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(loa)
                                                }
                                                title="Delete"
                                                aria-label={`Delete ${loa.loa_number}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500/80 transition hover:bg-red-500/10 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:outline-none"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <PaginationFooter
                    from={loas.from}
                    to={loas.to}
                    total={loas.total}
                    links={loas.links}
                />
            </div>
        </AdminLayout>
    );
}
