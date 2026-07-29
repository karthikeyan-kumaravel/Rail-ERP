import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/vendors';

type VendorDetail = {
    unique_id: string;
    company_name: string;
    name: string;
    contact_no: string;
    alternate_contact_no: string | null;
    email: string | null;
    gst_no: string | null;
    pan_no: string;
    pincode: string;
    state: string | null;
    district: string | null;
    zone_name: string | null;
    bank_name: string;
    branch_name: string | null;
    account_no: string;
    ifsc_code: string;
    account_holder_name: string;
    address: string;
    username: string | null;
    active_status: boolean;
    pan_proof_url: string | null;
    bank_proof_url: string | null;
    created_at: string | null;
};

type VendorShowProps = {
    vendor: VendorDetail;
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

export default function VendorShow({ vendor }: VendorShowProps) {
    return (
        <AdminLayout
            title={`Vendor - ${vendor.company_name}`}
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
                            Vendor
                        </Link>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            {vendor.company_name}
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
                            {vendor.company_name}
                        </p>
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                vendor.active_status
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-600'
                            }`}
                        >
                            {vendor.active_status ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <DetailField label="Name" value={vendor.name} />
                    <DetailField label="Contact No" value={vendor.contact_no} />
                    <DetailField
                        label="Alternate Contact No"
                        value={vendor.alternate_contact_no}
                    />
                    <DetailField label="Mail ID" value={vendor.email} />
                    <DetailField label="GST No" value={vendor.gst_no} />
                    <DetailField label="PAN No" value={vendor.pan_no} />
                    <DetailField label="Pincode" value={vendor.pincode} />
                    <DetailField label="State" value={vendor.state} />
                    <DetailField label="District" value={vendor.district} />
                    <DetailField label="Zone Name" value={vendor.zone_name} />
                    <DetailField label="User Name" value={vendor.username} />
                    <DetailField label="Created" value={vendor.created_at} />
                    <div className="sm:col-span-2">
                        <DetailField label="Address" value={vendor.address} />
                    </div>
                </div>

                <div className="mt-6 border-t border-[var(--color-border)] pt-6">
                    <p className="mb-4 text-xs font-semibold tracking-wide text-[var(--color-ink)]/55 uppercase">
                        Bank Details
                    </p>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <DetailField
                            label="Bank Name"
                            value={vendor.bank_name}
                        />
                        <DetailField
                            label="Branch Name"
                            value={vendor.branch_name}
                        />
                        <DetailField
                            label="Account No"
                            value={vendor.account_no}
                        />
                        <DetailField
                            label="IFSC Code"
                            value={vendor.ifsc_code}
                        />
                        <DetailField
                            label="Account Holder Name"
                            value={vendor.account_holder_name}
                        />
                    </div>
                </div>

                <div className="mt-6 border-t border-[var(--color-border)] pt-6">
                    <p className="mb-4 text-xs font-semibold tracking-wide text-[var(--color-ink)]/55 uppercase">
                        Proof Documents
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {vendor.pan_proof_url ? (
                            <a
                                href={vendor.pan_proof_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-[var(--color-gold)]/30 px-4 py-2 text-sm font-semibold text-[var(--color-accent)] transition hover:border-[var(--color-accent)]/50"
                            >
                                View PAN Proof
                            </a>
                        ) : (
                            <span className="text-sm text-[var(--color-ink)]/55">
                                No PAN proof uploaded.
                            </span>
                        )}
                        {vendor.bank_proof_url ? (
                            <a
                                href={vendor.bank_proof_url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-[var(--color-gold)]/30 px-4 py-2 text-sm font-semibold text-[var(--color-accent)] transition hover:border-[var(--color-accent)]/50"
                            >
                                View Bank Proof
                            </a>
                        ) : (
                            <span className="text-sm text-[var(--color-ink)]/55">
                                No bank proof uploaded.
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
