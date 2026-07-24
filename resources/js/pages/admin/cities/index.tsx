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
import { create, destroy, edit, index } from '@/routes/admin/cities';

type CityRow = {
    unique_id: string;
    name: string;
    city_code: string | null;
    pincode: string;
    district_id: number;
    district: string | null;
    state: string | null;
    active_status: boolean;
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

type CitiesIndexProps = {
    cities: Paginated<CityRow>;
    filters: Filters;
};

const sortableColumns: { key: string; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'created_at', label: 'Created' },
];

export default function CitiesIndex({ cities, filters }: CitiesIndexProps) {
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

    const handleDelete = (city: CityRow) => {
        if (
            window.confirm(`Delete ${city.name}? This action cannot be undone.`)
        ) {
            router.delete(destroy.url(city.unique_id));
        }
    };

    const exportHeaders = [
        'S.No',
        'Name',
        'Created',
        'City Code',
        'Pincode',
        'District',
        'State',
        'Status',
    ];

    const exportRows = cities.data.map((city, i) => [
        String((cities.from ?? 1) + i),
        city.name,
        city.created_at ?? '',
        city.city_code ?? '',
        city.pincode,
        city.district ?? '',
        city.state ?? '',
        city.active_status ? 'Active' : 'Inactive',
    ]);

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '-';
        }

        return filters.direction === 'asc' ? '^' : 'v';
    };

    return (
        <AdminLayout
            title="City"
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
                            City
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
                            filename="cities.csv"
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
                        <SettingsImportActions module="cities" title="City" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] text-left text-sm">
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
                                <th className="px-3 py-3">City Code</th>
                                <th className="px-3 py-3">Pincode</th>
                                <th className="px-3 py-3">District</th>
                                <th className="px-3 py-3">State</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {cities.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-3 py-6 text-center text-[var(--color-ink)]/55"
                                    >
                                        No cities found.
                                    </td>
                                </tr>
                            )}
                            {cities.data.map((city, i) => (
                                <tr
                                    key={city.unique_id}
                                    className="border-b border-[var(--color-border-softer)] text-[var(--color-ink)]/85 transition-colors hover:bg-[var(--color-bg-soft)]"
                                >
                                    <td className="px-3 py-3">
                                        {(cities.from ?? 1) + i}
                                    </td>
                                    <td className="px-3 py-3">{city.name}</td>
                                    <td className="px-3 py-3">
                                        {city.created_at}
                                    </td>
                                    <td className="px-3 py-3">
                                        {city.city_code ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {city.pincode}
                                    </td>
                                    <td className="px-3 py-3">
                                        {city.district ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {city.state ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                city.active_status
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-red-50 text-red-600'
                                            }`}
                                        >
                                            {city.active_status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="flex items-center gap-3">
                                            {auth.isSuperAdmin ? (

                                                <Link

                                                    href={edit.url(city.unique_id)}

                                                    title="Edit"

                                                    aria-label={`Edit ${city.name}`}

                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"

                                                >

                                                    <PencilIcon />

                                                </Link>

                                            ) : (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedRecord(
                                                            city as Record<string, unknown>,
                                                        )
                                                    }
                                                    title="View"
                                                    aria-label={`View ${city.name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                                >
                                                    <EyeIcon />
</button>

                                            )}
                                            {auth.isSuperAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(city)
                                                    }
                                                    title="Delete"
                                                    aria-label={`Delete ${city.name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500/80 transition hover:bg-red-500/10 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:outline-none"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <PaginationFooter
                    from={cities.from}
                    to={cities.to}
                    total={cities.total}
                    links={cities.links}
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
