import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { create, destroy, edit, index } from '@/routes/admin/users';

type UserRow = {
    id: number;
    name: string;
    username: string | null;
    mobile_no: string | null;
    user_type: string | null;
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

type UsersIndexProps = {
    users: Paginated<UserRow>;
    filters: Filters;
};

const sortableColumns: { key: string; label: string }[] = [
    { key: 'name', label: 'Staff Name' },
    { key: 'username', label: 'User Name' },
    { key: 'mobile_no', label: 'Mobile No' },
];

const perPageOptions = [10, 25, 50, 100];

export default function UsersIndex({ users, filters }: UsersIndexProps) {
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

    const applyPerPage = (perPage: number) => {
        router.get(
            index.url(),
            { ...filters, per_page: perPage, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (user: UserRow) => {
        if (
            window.confirm(`Delete ${user.name}? This action cannot be undone.`)
        ) {
            router.delete(destroy.url(user.id));
        }
    };

    const handleCopy = () => {
        const header = [
            'S.No',
            'Staff Name',
            'User Name',
            'Mobile No',
            'User Type',
        ];
        const rows = users.data.map((user, i) => [
            String(users.from ? users.from + i : i + 1),
            user.name,
            user.username ?? '',
            user.mobile_no ?? '',
            user.user_type ?? '',
        ]);
        const text = [header, ...rows].map((row) => row.join('\t')).join('\n');
        navigator.clipboard?.writeText(text);
    };

    const handleCsv = () => {
        const header = [
            'S.No',
            'Staff Name',
            'User Name',
            'Mobile No',
            'User Type',
        ];
        const rows = users.data.map((user, i) => [
            String(users.from ? users.from + i : i + 1),
            user.name,
            user.username ?? '',
            user.mobile_no ?? '',
            user.user_type ?? '',
        ]);
        const csv = [header, ...rows]
            .map((row) =>
                row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','),
            )
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'users.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '↕';
        }

        return filters.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <AdminLayout
            title="User Creation"
            withBackgroundImage
            header={
                <div className="flex items-center justify-between print:hidden">
                    <div className="text-sm">
                        <span className="text-[#fdede1]/55">Admin</span>
                        <span className="mx-1.5 text-[#fdede1]/40">/</span>
                        <span className="font-semibold text-[#fdede1]">
                            User Creation
                        </span>
                    </div>
                    <Link
                        href={create.url()}
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

                        <div className="ml-3 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="rounded-md border border-[#e0a94a]/25 px-3 py-1.5 text-xs font-semibold text-[#fdede1]/80 transition hover:border-[#f2905c]/50 hover:text-[#f2905c]"
                            >
                                Copy
                            </button>
                            <button
                                type="button"
                                onClick={handleCsv}
                                className="rounded-md border border-[#e0a94a]/25 px-3 py-1.5 text-xs font-semibold text-[#fdede1]/80 transition hover:border-[#f2905c]/50 hover:text-[#f2905c]"
                            >
                                CSV
                            </button>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="rounded-md border border-[#e0a94a]/25 px-3 py-1.5 text-xs font-semibold text-[#fdede1]/80 transition hover:border-[#f2905c]/50 hover:text-[#f2905c]"
                            >
                                Print
                            </button>
                        </div>
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
                    <table className="w-full min-w-[720px] text-left text-sm">
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
                                <th className="px-3 py-3">User Type</th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-3 py-6 text-center text-[#fdede1]/55"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}
                            {users.data.map((user, i) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-[#e0a94a]/10 text-[#fdede1]/85 hover:bg-[#16324a]/50"
                                >
                                    <td className="px-3 py-3">
                                        {(users.from ?? 1) + i}
                                    </td>
                                    <td className="px-3 py-3">{user.name}</td>
                                    <td className="px-3 py-3">
                                        {user.username}
                                    </td>
                                    <td className="px-3 py-3">
                                        {user.mobile_no}
                                    </td>
                                    <td className="px-3 py-3">
                                        {user.user_type}
                                    </td>
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={edit.url(user.id)}
                                                title="Edit"
                                                className="text-[#e0a94a]/80 transition hover:text-[#f2905c]"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(user)
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
                        Showing {users.from ?? 0} to {users.to ?? 0} of{' '}
                        {users.total} entries
                    </p>
                    <div className="flex items-center gap-1">
                        {users.links.map((link, i) => (
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
