import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { show } from '@/actions/App/Http/Controllers/Admin/BankController';
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
import { create, destroy, edit, index } from '@/routes/admin/banks';

type BankRow = {
    unique_id: string;
    name: string;
    branch_name: string;
    ifsc_code: string;
    account_number: string;
    account_holder_name: string;
    account_type: string;
    bank_address: string;
    pincode: string;
    contact_number: string;
    email: string;
    active_status: boolean;
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
    bank_name: string;
    holder_name: string;
    sort: string;
    direction: 'asc' | 'desc';
    per_page: PerPageValue;
};

type BanksIndexProps = {
    banks: Paginated<BankRow>;
    bankNames: string[];
    holderNames: string[];
    filters: Filters;
};

const sortableColumns = [
    { key: 'name', label: 'Bank Name' },
    { key: 'branch_name', label: 'Branch Name' },
];

export default function BanksIndex({
    banks,
    bankNames,
    holderNames,
    filters,
}: BanksIndexProps) {
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

    const applyBankName = (bankName: string) => {
        router.get(
            index.url(),
            { ...filters, bank_name: bankName, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const applyHolderName = (holderName: string) => {
        router.get(
            index.url(),
            { ...filters, holder_name: holderName, page: 1 },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (bank: BankRow) => {
        if (
            window.confirm(`Delete ${bank.name}? This action cannot be undone.`)
        ) {
            router.delete(destroy.url(bank.unique_id));
        }
    };

    const exportHeaders = [
        'S.No',
        'Name',
        'Branch',
        'IFSC',
        'Account Number',
        'Account Holder',
        'Account Type',
        'Contact',
        'Email',
        'Status',
    ];

    const exportRows = banks.data.map((bank, i) => [
        String((banks.from ?? 1) + i),
        bank.name,
        bank.branch_name,
        bank.ifsc_code,
        bank.account_number,
        bank.account_holder_name,
        bank.account_type,
        bank.contact_number,
        bank.email,
        bank.active_status ? 'Active' : 'Inactive',
    ]);

    const sortIndicator = (column: string) => {
        if (filters.sort !== column) {
            return '-';
        }

        return filters.direction === 'asc' ? '^' : 'v';
    };

    return (
        <AdminLayout
            title="Bank"
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
                            Bank
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
                        htmlFor="bank-name-filter"
                        className="text-sm text-[var(--color-ink)]/70"
                    >
                        Bank Name:
                    </label>
                    <select
                        id="bank-name-filter"
                        value={filters.bank_name}
                        onChange={(event) => applyBankName(event.target.value)}
                        className="rounded-md border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                    >
                        <option value="">All Bank Names</option>
                        {bankNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label
                        htmlFor="holder-name-filter"
                        className="text-sm text-[var(--color-ink)]/70"
                    >
                        Holder Name:
                    </label>
                    <select
                        id="holder-name-filter"
                        value={filters.holder_name}
                        onChange={(event) =>
                            applyHolderName(event.target.value)
                        }
                        className="rounded-md border border-[var(--color-gold)]/25 bg-[var(--color-surface-soft)] px-3 py-1.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                    >
                        <option value="">All Holder Names</option>
                        {holderNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
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
                            filename="banks.csv"
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
                        <SettingsImportActions module="banks" title="Bank" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
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

                                <th className="px-3 py-3">IFSC</th>
                                {/* <th className="px-3 py-3">Account Number</th> */}
                                <th className="px-3 py-3">Account Holder</th>
                                {/* <th className="px-3 py-3">Account Type</th>
                           <th className="px-3 py-3">Address</th> */}
                                {/* <th className="px-3 py-3">Pincode</th>
                           <th className="px-3 py-3">Contact</th>
                           <th className="px-3 py-3">Email</th> */}
                                <th className="px-3 py-3">Status</th>
                                <th className="px-3 py-3 print:hidden">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {banks.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="px-3 py-6 text-center text-[var(--color-ink)]/55"
                                    >
                                        No banks found.
                                    </td>
                                </tr>
                            )}
                            {banks.data.map((bank, i) => (
                                <tr
                                    key={bank.unique_id}
                                    className="border-b border-[var(--color-border-softer)] text-[var(--color-ink)]/85 transition-colors hover:bg-[var(--color-bg-soft)]"
                                >
                                    {/* S.No */}
                                    <td className="px-3 py-3">
                                        {(banks.from ?? 1) + i}
                                    </td>

                                    <td className="px-3 py-3">
                                        <Link
                                            href={`/admin/banks/${bank.unique_id}`}
                                            className="font-semibold text-[var(--color-accent)] hover:underline"
                                        >
                                            {bank.name}
                                        </Link>
                                    </td>

                                    {/* Branch Name */}
                                    <td className="px-3 py-3">
                                        {bank.branch_name}
                                    </td>

                                    {/* IFSC */}
                                    <td className="px-3 py-3">
                                        {bank.ifsc_code}
                                    </td>

                                    {/* Account Number */}
                                    {/* <td className="px-3 py-3">
                                   {bank.account_number}
                               </td> */}

                                    {/* Account Holder */}
                                    <td className="px-3 py-3">
                                        {bank.account_holder_name}
                                    </td>

                                    {/* Account Type */}
                                    {/* <td className="px-3 py-3">
                                 {bank.account_type}
                                      </td> */}

                                    {/* <td className="px-3 py-3">
                                {bank.bank_address}
                                       </td>

                                     <td className="px-3 py-3">
                                      {bank.pincode}
                                      </td>
     */}
                                    {/* Contact */}
                                    {/* <td className="px-3 py-3">
                                     {bank.contact_number}
                                  </td> */}

                                    {/* Email */}
                                    {/* <td className="px-3 py-3">
                                           {bank.email}
                                   </td>
  */}
                                    {/* Status */}
                                    <td className="px-3 py-3">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                bank.active_status
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-red-50 text-red-600'
                                            }`}
                                        >
                                            {bank.active_status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-3 py-3 print:hidden">
                                        <div className="items- center flex gap-3">
                                            {auth.isSuperAdmin ? (

                                                <Link

                                                    href={edit.url(bank.unique_id)}

                                                    title="Edit"

                                                    aria-label={`Edit ${bank.name}`}

                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"

                                                >

                                                    <PencilIcon className="h-4 w-4" />

                                                </Link>

                                            ) : (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedRecord(
                                                            bank as Record<string, unknown>,
                                                        )
                                                    }
                                                    title="View"
                                                    aria-label={`View ${bank.name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-gold)]/80 transition hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>

                                            )}
                                            {auth.isSuperAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(bank)
                                                    }
                                                    title="Delete"
                                                    aria-label={`Delete ${bank.name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500/80 transition hover:bg-red-500/10 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:outline-none"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}

                                            {bank.unique_id && (
                                                <Link
                                                    href={show.url(
                                                        bank.unique_id,
                                                    )}
                                                    title="View"
                                                    aria-label={`View ${bank.name}`}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-accent)]/80 transition hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:outline-none"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <PaginationFooter
                    from={banks.from}
                    to={banks.to}
                    total={banks.total}
                    links={banks.links}
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
