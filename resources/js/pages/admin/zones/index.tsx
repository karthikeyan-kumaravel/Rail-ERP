import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import ExportToolbar from '@/lib/export-toolbar';
import { PencilIcon, TrashIcon } from '@/lib/icons';
import SettingsImportActions from '@/lib/settings-import-actions';
import { PaginationFooter, PerPageSelect } from '@/lib/table-pagination';
import type { PerPageValue } from '@/lib/table-pagination';
import { create, destroy, edit, index } from '@/routes/admin/zones';

type ZoneRow = {
    unique_id: string;
    name: string;
    code: string | null;
    active_status: boolean;
    divisions_count: number;
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

type ZonesIndexProps = {
    zones: Paginated<ZoneRow>;
    filters: Filters;
};

const sortableColumns: { key: string; label: string }[] = [
    { key: 'name', label: 'Zone' },
    { key: 'code', label: 'Code' },
    { key: 'created_at', label: 'Created' },
];

export default function ZonesIndex({ zones, filters }: ZonesIndexProps) {
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

    const handleDelete = (zone: ZoneRow) => {
        if (
            window.confirm(`Delete ${zone.name}? This action cannot be undone.`)
        ) {
            router.delete(destroy.url(zone.unique_id));
        }
    };

    const exportHeaders = ['S.No', 'Zone', 'Code', 'Created', 'Divisions'];

    const exportRows = zones.data.map((zone, i) => [
        String((zones.from ?? 1) + i),
        zone.name,
        zone.code ?? '',
        zone.created_at ?? '',
        zone.divisions_count,
    ]);

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '-';
        }

        return filters.direction === 'asc' ? '^' : 'v';
    };

    return (
        <AdminLayout
            title="Zone"
            withBackgroundImage
            header={
                <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="text-sm">
                        <span className="text-[var(--color-ink)]/55">Admin</span>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">/</span>
                        <span className="text-[var(--color-ink)]/55">Settings</span>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">/</span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            Zone
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
                            filename="zones.csv"
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
                            className="w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                        />
                        <SettingsImportActions module="zones" title="Zone" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)] text-xs font-semibold tracking-wide text-[var(--color-ink)]/60 uppercase">
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
                                <th className="px-3 py-3">Divisions</th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {zones.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-3 py-6 text-center text-[var(--color-ink)]/55"
                                    >
                                        No zones found.
                                    </td>
                                </tr>
                            )}
                            {zones.data.map((zone, i) => (
                                <tr
                                    key={zone.unique_id}
                                    className="border-b border-[var(--color-border-softer)] text-[var(--color-ink)]/85 transition-colors hover:bg-[var(--color-bg-soft)]"
                                >
                                    <td className="px-3 py-3">
                                        {(zones.from ?? 1) + i}
                                    </td>
                                    <td className="px-3 py-3">{zone.name}</td>
                                    <td className="px-3 py-3">{zone.code}</td>
                                    <td className="px-3 py-3">
                                        {zone.created_at}
                                    </td>
                                    <td className="px-3 py-3">
                                        {zone.divisions_count}
                                    </td>
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={edit.url(
                                                    zone.unique_id,
                                                )}
                                                title="Edit"
                                                aria-label={`Edit ${zone.name}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                            >
                                                <PencilIcon />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(zone)
                                                }
                                                title="Delete"
                                                aria-label={`Delete ${zone.name}`}
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
                    from={zones.from}
                    to={zones.to}
                    total={zones.total}
                    links={zones.links}
                />
            </div>
        </AdminLayout>
    );
}
