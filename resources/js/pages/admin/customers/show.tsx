import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/customers';

type CustomerDetail = {
    unique_id: string;
    name: string;
    billing_address: string;
    pin_code: string;
    state: string | null;
    district: string | null;
    zone: string;
    contact_name: string;
    contact_number: string;
    contact_landline_number: string | null;
    email: string | null;
    active_status: boolean;
    created_at: string | null;
};

type CustomerShowProps = {
    customer: CustomerDetail;
};

function DetailField({
    label,
    value,
}: {
    label: string;
    value: string | null;
}) {
    return (
        <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--color-ink)]/55 uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink)]">
                {value ?? '—'}
            </p>
        </div>
    );
}

export default function CustomerShow({ customer }: CustomerShowProps) {
    return (
        <AdminLayout
            title={`Customer - ${customer.name}`}
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
                        <Link
                            href={index.url()}
                            className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                        >
                            Customer
                        </Link>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            {customer.name}
                        </span>
                    </div>
                    <Link
                        href={index.url()}
                        className="rounded-lg border border-[var(--color-gold)]/30 px-4 py-2 text-sm font-semibold text-[var(--color-ink)]/75 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Back
                    </Link>
                </div>
            }
        >
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6">
                <div className="mb-6 flex items-center gap-3">
                    <div>
                        <p className="text-lg font-semibold text-[var(--color-ink)]">
                            {customer.name}
                        </p>
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                customer.active_status
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-600'
                            }`}
                        >
                            {customer.active_status ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <DetailField
                        label="Contact Name"
                        value={customer.contact_name}
                    />
                    <DetailField
                        label="Contact Number"
                        value={customer.contact_number}
                    />
                    <DetailField
                        label="Contact Landline Number"
                        value={customer.contact_landline_number}
                    />
                    <DetailField label="Email" value={customer.email} />
                    <DetailField label="State" value={customer.state} />
                    <DetailField label="District" value={customer.district} />
                    <DetailField label="Zone" value={customer.zone} />
                    <DetailField label="Pin Code" value={customer.pin_code} />
                    <div className="sm:col-span-2">
                        <DetailField
                            label="Billing Address"
                            value={customer.billing_address}
                        />
                    </div>
                    <DetailField label="Created" value={customer.created_at} />
                </div>
            </div>
        </AdminLayout>
    );
}
