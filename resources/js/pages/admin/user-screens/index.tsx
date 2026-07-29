import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import DetailsModal, {
    buildDetailsFromRecord,
    resolveRecordTitle,
} from '@/lib/details-modal';
import ExportToolbar from '@/lib/export-toolbar';
import { DynamicIcon, EyeIcon, PencilIcon, TrashIcon } from '@/lib/icons';
import { PaginationFooter, PerPageSelect } from '@/lib/table-pagination';
import type { PerPageValue } from '@/lib/table-pagination';
import {
    create,
    destroy,
    edit,
    index,
} from '@/routes/admin/user-screens';

type UserScreenRow = {
    unique_id: string;
    screen_name: string;
    main_screen: string | null;
    folder_name: string;
    order_no: number;
    icon: string;
    status: boolean;
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

type UserScreensIndexProps = {
    userScreens: Paginated<UserScreenRow>;
    filters: Filters;
};

const sortableColumns: { key: string; label: string }[] = [
    { key: 'screen_name', label: 'Screen Name' },
    { key: 'order_no', label: 'Order No' },
    { key: 'created_at', label: 'Created' },
];

const READ_ONLY_ADD_ROLES = [
    'accounts team',
    'operation team',
    'service engineer',
    'stores team',
];

export default function UserScreensIndex({
    userScreens,
    filters,
}: UserScreensIndexProps) {
    const { flash, auth } = usePage().props;
    const authRole = String(auth.role ?? '').trim().toLowerCase();
    const showAddButton =
        Boolean(auth.canCreate) && !READ_ONLY_ADD_ROLES.includes(authRole);
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

    const handleDelete = (userScreen: UserScreenRow) => {
        if (
            window.confirm(
                `Delete ${userScreen.screen_name}? This action cannot be undone.`,
            )
        ) {
            router.delete(destroy.url(userScreen.unique_id));
        }
    };

    const exportHeaders = [
        'S.No',
        'Screen Name',
        'Order No',
        'Created',
        'Main Screen',
        'Folder Name',
        'Status',
    ];

    const exportRows = userScreens.data.map((userScreen, i) => [
        String((userScreens.from ?? 1) + i),
        userScreen.screen_name,
        userScreen.order_no,
        userScreen.created_at ?? '',
        userScreen.main_screen ?? '',
        userScreen.folder_name,
        userScreen.status ? 'Active' : 'Inactive',
    ]);

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '-';
        }

        return filters.direction === 'asc' ? '^' : 'v';
    };

    return (
        <AdminLayout
            title="User Screen"
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
                            User Screen
                        </span>
                    </div>
                    {showAddButton && (
                        <Link
                            href={create.url()}
                            className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                        >
                            + Add New
                        </Link>
                    )}
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
                            filename="user-screens.csv"
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
                                <th className="px-3 py-3">Main Screen</th>
                                <th className="px-3 py-3">Folder Name</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {userScreens.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-3 py-6 text-center text-[var(--color-ink)]/55"
                                    >
                                        No user screens found.
                                    </td>
                                </tr>
                            )}
                            {userScreens.data.map((userScreen, i) => (
                                <tr
                                    key={userScreen.unique_id}
                                    className="border-b border-[var(--color-border-softer)] text-[var(--color-ink)]/85 transition-colors hover:bg-[var(--color-bg-soft)]"
                                >
                                    <td className="px-3 py-3">
                                        {(userScreens.from ?? 1) + i}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="flex items-center gap-2">
                                            <DynamicIcon
                                                name={userScreen.icon}
                                                className="h-4 w-4 text-[var(--color-gold)]"
                                            />
                                            {userScreen.screen_name}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        {userScreen.order_no}
                                    </td>
                                    <td className="px-3 py-3">
                                        {userScreen.created_at}
                                    </td>
                                    <td className="px-3 py-3">
                                        {userScreen.main_screen ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {userScreen.folder_name}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                userScreen.status
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-red-50 text-red-600'
                                            }`}
                                        >
                                            {userScreen.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="flex items-center gap-3">
                                            {auth.isSuperAdmin ? (

                                                <Link

                                                    href={edit.url(userScreen.unique_id,)}

                                                    title="Edit"

                                                    aria-label={`Edit ${userScreen.screen_name}`}

                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"

                                                >

                                                    <PencilIcon />

                                                </Link>

                                            ) : (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedRecord(
                                                            userScreen as Record<string, unknown>,
                                                        )
                                                    }
                                                    title="View"
                                                    aria-label={`View ${userScreen.screen_name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                                >
                                                    <EyeIcon />
</button>

                                            )}
                                            {auth.isSuperAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(userScreen)
                                                    }
                                                    title="Delete"
                                                    aria-label={`Delete ${userScreen.screen_name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500/80 transition hover:bg-red-500/10 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:outline-none"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                            <Link
                                                href={show.url(
                                                    userScreen.unique_id,
                                                )}
                                                title="View"
                                                aria-label={`View ${userScreen.screen_name}`}
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
                    from={userScreens.from}
                    to={userScreens.to}
                    total={userScreens.total}
                    links={userScreens.links}
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
