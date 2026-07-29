import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import ExportToolbar from '@/lib/export-toolbar';
import { EyeIcon, PencilIcon, TrashIcon } from '@/lib/icons';
import SettingsImportActions from '@/lib/settings-import-actions';
import { PaginationFooter, PerPageSelect } from '@/lib/table-pagination';
import type { PerPageValue } from '@/lib/table-pagination';
import { create, destroy, edit, index, show } from '@/routes/admin/customers';

type CustomerRow = {
    unique_id: string;
    name: string;
    contact_name: string;
    contact_number: string;
    state_id: number;
    state: string | null;
    district_id: number;
    district: string | null;
    pin_code: string;
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

type StateOption = { id: number; name: string };

type Filters = {
    search: string;
    customer_name: string;
    contact_name: string;
    state_id: number | '';
    sort: string;
    direction: 'asc' | 'desc';
    per_page: PerPageValue;
};

type CustomersIndexProps = {
    customers: Paginated<CustomerRow>;
    customerNames: string[];
    contactNames: string[];
    states: StateOption[];
    filters: Filters;
};

const sortableColumns: { key: string; label: string }[] = [
    { key: 'name', label: 'Customer Name' },
    { key: 'contact_name', label: 'Contact Name' },
    { key: 'created_at', label: 'Created' },
];

export default function CustomersIndex({
    customers,
    customerNames = [],
    contactNames = [],
    states = [],
    filters,
}: CustomersIndexProps) {
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

    const applyCustomerName = (customerName: string) => {
        router.get(
            index.url(),
            { ...filters, customer_name: customerName, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const applyContactName = (contactName: string) => {
        router.get(
            index.url(),
            { ...filters, contact_name: contactName, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const applyState = (stateId: number | '') => {
        router.get(
            index.url(),
            { ...filters, state_id: stateId, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (customer: CustomerRow) => {
        if (
            window.confirm(
                `Delete ${customer.name}? This action cannot be undone.`,
            )
        ) {
            router.delete(destroy.url(customer.unique_id));
        }
    };

    const exportHeaders = [
        'S.No',
        'Customer Name',
        'Contact Name',
        'Created',
        'State',
        'District',
        'Pin Code',
        'Status',
    ];

    const exportRows = customers.data.map((customer, i) => [
        String((customers.from ?? 1) + i),
        customer.name,
        customer.contact_name,
        customer.created_at ?? '',
        customer.state ?? '',
        customer.district ?? '',
        customer.pin_code,
        customer.active_status ? 'Active' : 'Inactive',
    ]);

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '-';
        }

        return filters.direction === 'asc' ? '^' : 'v';
    };

    return (
        <AdminLayout
            title="Customer"
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
                            Customer
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
                        htmlFor="customer-name-filter"
                        className="text-sm text-[var(--color-ink)]/70"
                    >
                        Customer Name:
                    </label>
                    <select
                        id="customer-name-filter"
                        value={filters.customer_name}
                        onChange={(event) =>
                            applyCustomerName(event.target.value)
                        }
                        className="rounded-md border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                    >
                        <option value="">All Customer Names</option>
                        {customerNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label
                        htmlFor="contact-name-filter"
                        className="text-sm text-[var(--color-ink)]/70"
                    >
                        Contact Name:
                    </label>
                    <select
                        id="contact-name-filter"
                        value={filters.contact_name}
                        onChange={(event) =>
                            applyContactName(event.target.value)
                        }
                        className="rounded-md border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                    >
                        <option value="">All Contact Names</option>
                        {contactNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label
                        htmlFor="state-filter"
                        className="text-sm text-[var(--color-ink)]/70"
                    >
                        State:
                    </label>
                    <select
                        id="state-filter"
                        value={filters.state_id}
                        onChange={(event) =>
                            applyState(
                                event.target.value
                                    ? Number(event.target.value)
                                    : '',
                            )
                        }
                        className="rounded-md border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                    >
                        <option value="">All States</option>
                        {states.map((state) => (
                            <option key={state.id} value={state.id}>
                                {state.name}
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
                            filename="customers.csv"
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
                            module="customers"
                            title="Customer"
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
                                <th className="px-3 py-3">District</th>
                                <th className="px-3 py-3">Pin Code</th>
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-3 py-6 text-center text-[var(--color-ink)]/55"
                                    >
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                            {customers.data.map((customer, i) => (
                                <tr
                                    key={customer.unique_id}
                                    className="border-b border-[var(--color-border-softer)] text-[var(--color-ink)]/85 transition-colors hover:bg-[var(--color-bg-soft)]"
                                >
                                    <td className="px-3 py-3">
                                        {(customers.from ?? 1) + i}
                                    </td>
                                    <td className="px-3 py-3">
                                        {customer.name}
                                    </td>
                                    <td className="px-3 py-3">
                                        {customer.contact_name}
                                    </td>
                                    <td className="px-3 py-3">
                                        {customer.created_at}
                                    </td>
                                    <td className="px-3 py-3">
                                        {customer.state ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {customer.district ?? '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        {customer.pin_code}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                customer.active_status
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-red-50 text-red-600'
                                            }`}
                                        >
                                            {customer.active_status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="flex items-center gap-3">
                                            {auth.isSuperAdmin ? (

                                                <Link

                                                    href={edit.url(customer.unique_id,)}

                                                    title="Edit"

                                                    aria-label={`Edit ${customer.name}`}

                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"

                                                >

                                                    <PencilIcon />

                                                </Link>

                                            ) : (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedRecord(
                                                            customer as Record<string, unknown>,
                                                        )
                                                    }
                                                    title="View"
                                                    aria-label={`View ${customer.name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                                >
                                                    <EyeIcon />
</button>

                                            )}
                                            {auth.isSuperAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(customer)
                                                    }
                                                    title="Delete"
                                                    aria-label={`Delete ${customer.name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500/80 transition hover:bg-red-500/10 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:outline-none"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                            <Link
                                                href={show.url(
                                                    customer.unique_id,
                                                )}
                                                title="View"
                                                aria-label={`View ${customer.name}`}
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
                    from={customers.from}
                    to={customers.to}
                    total={customers.total}
                    links={customers.links}
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
