import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import ExportToolbar from '@/lib/export-toolbar';
import { PencilIcon, TrashIcon } from '@/lib/icons';
import SettingsImportActions from '@/lib/settings-import-actions';
import { PaginationFooter, PerPageSelect } from '@/lib/table-pagination';
import type { PerPageValue } from '@/lib/table-pagination';
import { create, destroy, edit, index } from '@/routes/admin/districts';

type DistrictRow = {
    unique_id: string;
    name: string;
    code: string | null;
    state: string | null;
    state_id: number;
    active_status: boolean;
    cities_count: number;
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

type DistrictsIndexProps = {
    districts: Paginated<DistrictRow>;
    filters: Filters;
};

const sortableColumns: { key: string; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'created_at', label: 'Created' },
];

export default function DistrictsIndex({
    districts,
    filters,
}: DistrictsIndexProps) {
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

    const handleDelete = (district: DistrictRow) => {
        if (
            window.confirm(
                `Delete ${district.name}? This action cannot be undone.`,
            )
        ) {
            router.delete(destroy.url(district.unique_id));
        }
    };

    const exportHeaders = [
        'S.No',
        'Name',
        'Created',
        'State',
        'Code',
        'Cities',
        'Status',
    ];

    const exportRows = districts.data.map((district, i) => [
        String((districts.from ?? 1) + i),
        district.name,
        district.created_at ?? '',
        district.state ?? '',
        district.code ?? '',
        district.cities_count,
        district.active_status ? 'Active' : 'Inactive',
    ]);

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '-';
        }

        return filters.direction === 'asc' ? '^' : 'v';
    };

    return (
        <AdminLayout
            title="District"
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
                            District
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
                            filename="districts.csv"
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
                        <SettingsImportActions
                            module="districts"
                            title="District"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
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
                                <th className="px-3 py-3">State</th>
                                <th className="px-3 py-3">Cities</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {districts.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-3 py-6 text-center text-[var(--color-ink)]/55"
                                    >
                                        No districts found.
                                    </td>
                                </tr>
                            )}
                            {districts.data.map((district, i) => (
                                <tr
                                    key={district.unique_id}
                                    className="border-b border-[var(--color-border-softer)] text-[var(--color-ink)]/85 transition-colors hover:bg-[var(--color-bg-soft)]"
                                >
                                    <td className="px-3 py-3">
                                        {(districts.from ?? 1) + i}
                                    </td>
                                    <td className="px-3 py-3">
                                        {district.name}
                                    </td>
                                    <td className="px-3 py-3">
                                        {district.created_at}
                                    </td>
                                    <td className="px-3 py-3">
                                        {district.state ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {district.cities_count}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                district.active_status
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-red-50 text-red-600'
                                            }`}
                                        >
                                            {district.active_status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={edit.url(
                                                    district.unique_id,
                                                )}
                                                title="Edit"
                                                aria-label={`Edit ${district.name}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                            >
                                                <PencilIcon />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(district)
                                                }
                                                title="Delete"
                                                aria-label={`Delete ${district.name}`}
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
                    from={districts.from}
                    to={districts.to}
                    total={districts.total}
                    links={districts.links}
                />
            </div>
        </AdminLayout>
    );
}
