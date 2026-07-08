import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';

const userTypesUrl = '/admin/user-types';

type UserTypeRow = {
    id: number;
    name: string;
    active_status: boolean;
    users_count: number;
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
    per_page: number;
};

type UserTypesIndexProps = {
    userTypes: Paginated<UserTypeRow>;
    filters: Filters;
};

const sortableColumns: { key: string; label: string }[] = [
    { key: 'name', label: 'User Type' },
    { key: 'created_at', label: 'Created' },
];

const perPageOptions = [10, 25, 50, 100];

export default function UserTypesIndex({
    userTypes,
    filters,
}: UserTypesIndexProps) {
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
                userTypesUrl,
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
            userTypesUrl,
            { ...filters, sort: column, direction },
            { preserveState: true, replace: true },
        );
    };

    const applyPerPage = (perPage: number) => {
        router.get(
            userTypesUrl,
            { ...filters, per_page: perPage, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (userType: UserTypeRow) => {
        if (
            window.confirm(
                `Delete ${userType.name}? This action cannot be undone.`,
            )
        ) {
            router.delete(`${userTypesUrl}/${userType.id}`);
        }
    };

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '-';
        }

        return filters.direction === 'asc' ? '^' : 'v';
    };

    return (
        <AdminLayout
            title="User Type"
            withBackgroundImage
            header={
                <div className="flex items-center justify-between print:hidden">
                    <div className="text-sm">
                        <span className="text-[#fdede1]/55">Admin</span>
                        <span className="mx-1.5 text-[#fdede1]/40">/</span>
                        <span className="font-semibold text-[#fdede1]">
                            User Type
                        </span>
                    </div>
                    <Link
                        href={`${userTypesUrl}/create`}
                        className="rounded-lg bg-linear-to-r from-[#f2905c] to-[#c9a227] px-4 py-2 text-sm font-semibold text-[#0f2436] shadow-lg transition hover:brightness-110"
                    >
                        + Add New
                    </Link>
                </div>
            }
        >
            <div className="rounded-xl border border-[#e0a94a]/20 bg-[#0a1a28]/75 p-6 shadow-2xl backdrop-blur-xl">
                {flash.success && (
                    <div className="mb-4 rounded-lg border border-[#c9a227]/30 bg-[#c9a227]/10 px-4 py-2 text-sm text-[#fdede1]">
                        {flash.success}
                    </div>
                )}

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[#fdede1]/70">Show</span>
                        <select
                            value={filters.per_page}
                            onChange={(event) =>
                                applyPerPage(Number(event.target.value))
                            }
                            className="rounded-md border border-[#e0a94a]/25 bg-[#0f2436] px-2 py-1.5 text-sm text-[#fdede1] outline-none focus:border-[#f2905c]"
                        >
                            {perPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-[#fdede1]/70">
                            entries
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[#fdede1]/70">
                            Search:
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-56 rounded-md border border-[#e0a94a]/25 bg-[#0f2436] px-3 py-1.5 text-sm text-[#fdede1] outline-none focus:border-[#f2905c]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-[#e0a94a]/20 text-xs tracking-wide text-[#e0a94a] uppercase">
                                <th className="px-3 py-3">S.No</th>
                                {sortableColumns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="cursor-pointer px-3 py-3 select-none"
                                        onClick={() => applySort(column.key)}
                                    >
                                        {column.label}{' '}
                                        <span className="text-[#fdede1]/40">
                                            {sortIndicator(column.key)}
                                        </span>
                                    </th>
                                ))}
                                <th className="px-3 py-3">Users</th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {userTypes.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-3 py-6 text-center text-[#fdede1]/55"
                                    >
                                        No user types found.
                                    </td>
                                </tr>
                            )}
                            {userTypes.data.map((userType, i) => (
                                <tr
                                    key={userType.id}
                                    className="border-b border-[#e0a94a]/10 text-[#fdede1]/85 hover:bg-[#16324a]/50"
                                >
                                    <td className="px-3 py-3">
                                        {(userTypes.from ?? 1) + i}
                                    </td>
                                    <td className="px-3 py-3">
                                        {userType.name}
                                    </td>
                                    <td className="px-3 py-3">
                                        {userType.created_at}
                                    </td>
                                    <td className="px-3 py-3">
                                        {userType.users_count}
                                    </td>
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`${userTypesUrl}/${userType.id}/edit`}
                                                title="Edit"
                                                className="text-[#e0a94a]/80 transition hover:text-[#f2905c]"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(userType)
                                                }
                                                title="Delete"
                                                className="text-red-400/80 transition hover:text-red-400"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <p className="text-sm text-[#fdede1]/60">
                        Showing {userTypes.from ?? 0} to {userTypes.to ?? 0} of{' '}
                        {userTypes.total} entries
                    </p>
                    <div className="flex items-center gap-1">
                        {userTypes.links.map((link, i) => (
                            <Link
                                key={`${link.label}-${i}`}
                                href={link.url ?? '#'}
                                preserveState
                                className={`rounded-md px-3 py-1.5 text-sm transition ${
                                    link.active
                                        ? 'bg-linear-to-r from-[#f2905c] to-[#c9a227] font-semibold text-[#0f2436]'
                                        : link.url
                                          ? 'text-[#fdede1]/70 hover:bg-[#16324a]'
                                          : 'cursor-not-allowed text-[#fdede1]/30'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
