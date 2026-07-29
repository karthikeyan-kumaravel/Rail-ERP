import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import DetailsModal, {
    buildDetailsFromRecord,
    resolveRecordTitle,
} from '@/lib/details-modal';
import ExportToolbar from '@/lib/export-toolbar';
import { EyeIcon, PencilIcon, TrashIcon } from '@/lib/icons';
import SettingsImportActions from '@/lib/settings-import-actions';
import { PaginationFooter, PerPageSelect } from '@/lib/table-pagination';
import type { PerPageValue } from '@/lib/table-pagination';
import { create, destroy, edit, index, show } from '@/routes/admin/divisions';

type DivisionRow = {
    unique_id: string;
    name: string;
    code: string | null;
    zone_id: number;
    zone: string | null;
    active_status: boolean;
    stations_count: number;
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

type ZoneOption = { id: number; name: string };

type Filters = {
    search: string;
    division_name: string;
    zone_id: number | '';
    sort: string;
    direction: 'asc' | 'desc';
    per_page: PerPageValue;
};

type DivisionsIndexProps = {
    divisions: Paginated<DivisionRow>;
    divisionNames: string[];
    zones: ZoneOption[];
    filters: Filters;
};

const sortableColumns: { key: string; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'created_at', label: 'Created' },
];

export default function DivisionsIndex({
    divisions,
    divisionNames = [],
    zones = [],
    filters,
}: DivisionsIndexProps) {
    const { flash, auth } = usePage().props;
    const [selectedRecord, setSelectedRecord] = useState<
        Record<string, unknown> | null
    >(null);
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

    const applyDivisionName = (divisionName: string) => {
        router.get(
            index.url(),
            { ...filters, division_name: divisionName, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const applyZone = (zoneId: number | '') => {
        router.get(
            index.url(),
            { ...filters, zone_id: zoneId, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (division: DivisionRow) => {
        if (
            window.confirm(
                `Delete ${division.name}? This action cannot be undone.`,
            )
        ) {
            router.delete(destroy.url(division.unique_id));
        }
    };

    const exportHeaders = [
        'S.No',
        'Name',
        'Created',
        'Zone',
        'Code',
        'Stations',
        'Status',
    ];

    const exportRows = divisions.data.map((division, i) => [
        String((divisions.from ?? 1) + i),
        division.name,
        division.created_at ?? '',
        division.zone ?? '',
        division.code ?? '',
        division.stations_count,
        division.active_status ? 'Active' : 'Inactive',
    ]);

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '-';
        }

        return filters.direction === 'asc' ? '^' : 'v';
    };

    return (
        <AdminLayout
            title="Division"
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
                            Division
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
            <div className="mb-4 flex flex-wrap items-center justify-start gap-4 print:hidden">
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="division-name-filter"
                        className="text-sm text-[var(--color-ink)]/70"
                    >
                        Division Name:
                    </label>
                    <select
                        id="division-name-filter"
                        value={filters.division_name}
                        onChange={(event) =>
                            applyDivisionName(event.target.value)
                        }
                        className="rounded-md border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                    >
                        <option value="">All Division Names</option>
                        {divisionNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label
                        htmlFor="zone-filter"
                        className="text-sm text-[var(--color-ink)]/70"
                    >
                        Zone:
                    </label>
                    <select
                        id="zone-filter"
                        value={filters.zone_id}
                        onChange={(event) =>
                            applyZone(
                                event.target.value
                                    ? Number(event.target.value)
                                    : '',
                            )
                        }
                        className="rounded-md border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                    >
                        <option value="">All Zones</option>
                        {zones.map((zone) => (
                            <option key={zone.id} value={zone.id}>
                                {zone.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

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
                            filename="divisions.csv"
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
                            module="divisions"
                            title="Division"
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
                                <th className="px-3 py-3">Zone</th>
                                <th className="px-3 py-3">Stations</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {divisions.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-3 py-6 text-center text-[var(--color-ink)]/55"
                                    >
                                        No divisions found.
                                    </td>
                                </tr>
                            )}
                            {divisions.data.map((division, i) => (
                                <tr
                                    key={division.unique_id}
                                    className="border-b border-[var(--color-border-softer)] text-[var(--color-ink)]/85 transition-colors hover:bg-[var(--color-bg-soft)]"
                                >
                                    <td className="px-3 py-3">
                                        {(divisions.from ?? 1) + i}
                                    </td>
                                    <td className="px-3 py-3">
                                        {division.name}
                                    </td>
                                    <td className="px-3 py-3">
                                        {division.created_at}
                                    </td>
                                    <td className="px-3 py-3">
                                        {division.zone ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {division.stations_count}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                division.active_status
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-red-50 text-red-600'
                                            }`}
                                        >
                                            {division.active_status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="flex items-center gap-3">
                                            {auth.isSuperAdmin ? (

                                                <Link

                                                    href={edit.url(division.unique_id,)}

                                                    title="Edit"

                                                    aria-label={`Edit ${division.name}`}

                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"

                                                >

                                                    <PencilIcon />

                                                </Link>

                                            ) : (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedRecord(
                                                            division as Record<string, unknown>,
                                                        )
                                                    }
                                                    title="View"
                                                    aria-label={`View ${division.name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                                >
                                                    <EyeIcon />
                                                </button>

                                            )}
                                            {auth.isSuperAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(division)
                                                    }
                                                    title="Delete"
                                                    aria-label={`Delete ${division.name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500/80 transition hover:bg-red-500/10 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:outline-none"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                            <Link
                                                href={show.url(
                                                    division.unique_id,
                                                )}
                                                title="View"
                                                aria-label={`View ${division.name}`}
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-accent)]/80 transition hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <PaginationFooter
                    from={divisions.from}
                    to={divisions.to}
                    total={divisions.total}
                    links={divisions.links}
                />
            </div>
            {selectedRecord && (
                <DetailsModal
                    title={resolveRecordTitle(selectedRecord)}
                    details={buildDetailsFromRecord(selectedRecord)}
                    onClose={() => setSelectedRecord(null)}
                />
            )}
        </AdminLayout>
    );
}
