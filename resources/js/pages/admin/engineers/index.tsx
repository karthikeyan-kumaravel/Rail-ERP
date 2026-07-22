import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import ExportToolbar from '@/lib/export-toolbar';
import { PencilIcon, TrashIcon } from '@/lib/icons';
import { PaginationFooter, PerPageSelect } from '@/lib/table-pagination';
import type { PerPageValue } from '@/lib/table-pagination';
import FlashToast from '@/lib/toast';
import { create, destroy, edit, index } from '@/routes/admin/engineers';

type EngineerRow = {
    unique_id: string;
    employee_code: string;
    full_name: string;
    mobile_number: string;
    official_email: string;
    engineer_type: string | null;
    employee_status: 'Active' | 'Retired' | 'Transferred';
    date_of_joining: string;
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

type EngineersIndexProps = {
    engineers: Paginated<EngineerRow>;
    filters: Filters;
};

const sortableColumns: { key: string; label: string }[] = [
    { key: 'employee_code', label: 'Employee ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'date_of_joining', label: 'Date of Joining' },
    { key: 'created_at', label: 'Created' },
];

const statusBadgeClass: Record<EngineerRow['employee_status'], string> = {
    Active: 'bg-emerald-50 text-emerald-700',
    Retired: 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]',
    Transferred: 'bg-blue-500/10 text-blue-600',
};

export default function EngineersIndex({
    engineers,
    filters,
}: EngineersIndexProps) {
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

    const handleDelete = (engineer: EngineerRow) => {
        if (
            window.confirm(
                `Delete ${engineer.full_name} (${engineer.employee_code})? This action cannot be undone.`,
            )
        ) {
            router.delete(destroy.url(engineer.unique_id));
        }
    };

    const exportHeaders = [
        'S.No',
        'Employee ID',
        'Name',
        'Mobile',
        'Official Email',
        'Engineer Type',
        'Status',
    ];

    const exportRows = engineers.data.map((engineer, i) => [
        String((engineers.from ?? 1) + i),
        engineer.employee_code,
        engineer.full_name,
        engineer.mobile_number,
        engineer.official_email,
        engineer.engineer_type ?? '',
        engineer.employee_status,
    ]);

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '-';
        }

        return filters.direction === 'asc' ? '^' : 'v';
    };

    return (
        <AdminLayout
            title="Engineer Master"
            withBackgroundImage
            header={
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="text-sm">
                        <span className="text-[var(--color-ink)]/55">
                            Admin / Settings
                        </span>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            Engineer Master
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
            <FlashToast />

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6">
                {flash.success && (
                    <div className="mb-4 rounded-lg border border-[var(--color-accent-2)]/30 bg-[var(--color-accent-2)]/10 px-4 py-2 text-sm text-[var(--color-ink)]">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-600">
                        {flash.error}
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
                            filename="engineers.csv"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
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
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-accent)]/10 text-xs font-semibold tracking-wide text-[var(--color-accent)] uppercase">
                                <th className="px-3 py-3">S.No</th>
                                {sortableColumns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="cursor-pointer px-3 py-3 select-none"
                                        onClick={() => applySort(column.key)}
                                    >
                                        {column.label}{' '}
                                        <span className="text-[var(--color-ink)]/40">
                                            {sortIndicator(column.key)}
                                        </span>
                                    </th>
                                ))}
                                <th className="px-3 py-3">Mobile</th>
                                <th className="px-3 py-3">Official Email</th>
                                <th className="px-3 py-3">Engineer Type</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {engineers.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="px-3 py-6 text-center text-[var(--color-ink)]/55"
                                    >
                                        No engineers found.
                                    </td>
                                </tr>
                            )}
                            {engineers.data.map((engineer, i) => (
                                <tr
                                    key={engineer.unique_id}
                                    className="border-b border-[var(--color-border-softer)] text-[var(--color-ink)]/85 transition-colors hover:bg-[var(--color-bg-soft)]"
                                >
                                    <td className="px-3 py-3">
                                        {(engineers.from ?? 1) + i}
                                    </td>
                                    <td className="px-3 py-3">
                                        {engineer.employee_code}
                                    </td>
                                    <td className="px-3 py-3">
                                        {engineer.full_name}
                                    </td>
                                    <td className="px-3 py-3">
                                        {engineer.date_of_joining}
                                    </td>
                                    <td className="px-3 py-3">
                                        {engineer.created_at}
                                    </td>
                                    <td className="px-3 py-3">
                                        {engineer.mobile_number}
                                    </td>
                                    <td className="px-3 py-3">
                                        {engineer.official_email}
                                    </td>
                                    <td className="px-3 py-3">
                                        {engineer.engineer_type ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass[engineer.employee_status]}`}
                                        >
                                            {engineer.employee_status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={edit.url(
                                                    engineer.unique_id,
                                                )}
                                                title="Edit"
                                                aria-label={`Edit ${engineer.full_name}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                            >
                                                <PencilIcon />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(engineer)
                                                }
                                                title="Delete"
                                                aria-label={`Delete ${engineer.full_name}`}
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
                    from={engineers.from}
                    to={engineers.to}
                    total={engineers.total}
                    links={engineers.links}
                />
            </div>
        </AdminLayout>
    );
}
