import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { index } from '@/routes/admin/engineers';

type EngineerDetail = {
    unique_id: string;
    employee_code: string;
    full_name: string | null;
    gender: string | null;
    date_of_birth: string | null;
    blood_group: string | null;
    nationality: string | null;
    marital_status: string | null;
    mobile_number: string | null;
    alternate_mobile_number: string | null;
    official_email: string | null;
    personal_email: string | null;
    current_address: string | null;
    permanent_address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    aadhaar_number: string | null;
    pan_number: string | null;
    date_of_joining: string | null;
    employee_status: 'Active' | 'Retired' | 'Transferred';
    engineer_type: string | null;
    bank_name: string | null;
    branch_name: string | null;
    account_number: string | null;
    ifsc_code: string | null;
    pf_account_number: string | null;
    esi_account_number: string | null;
    languages_known: string[] | null;
    created_at: string | null;
};

type EngineerShowProps = {
    engineer: EngineerDetail;
};

const statusBadgeClass: Record<EngineerDetail['employee_status'], string> = {
    Active: 'bg-emerald-50 text-emerald-700',
    Retired: 'bg-[var(--color-gold)]/15 text-[var(--color-gold)]',
    Transferred: 'bg-blue-500/10 text-blue-600',
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

export default function EngineerShow({ engineer }: EngineerShowProps) {
    return (
        <AdminLayout
            title={`Engineer - ${engineer.full_name ?? engineer.employee_code}`}
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
                            Engineer Master
                        </Link>
                        <span className="mx-1.5 text-[var(--color-ink)]/40">
                            /
                        </span>
                        <span className="font-semibold text-[var(--color-ink)]">
                            {engineer.full_name ?? engineer.employee_code}
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
                            {engineer.full_name ?? engineer.employee_code}
                        </p>
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass[engineer.employee_status]}`}
                        >
                            {engineer.employee_status}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <DetailField
                        label="Employee ID"
                        value={engineer.employee_code}
                    />
                    <DetailField
                        label="Engineer Type"
                        value={engineer.engineer_type}
                    />
                    <DetailField label="Gender" value={engineer.gender} />
                    <DetailField
                        label="Date of Birth"
                        value={engineer.date_of_birth}
                    />
                    <DetailField
                        label="Blood Group"
                        value={engineer.blood_group}
                    />
                    <DetailField
                        label="Nationality"
                        value={engineer.nationality}
                    />
                    <DetailField
                        label="Marital Status"
                        value={engineer.marital_status}
                    />
                    <DetailField
                        label="Date of Joining"
                        value={engineer.date_of_joining}
                    />
                    <DetailField
                        label="Languages Known"
                        value={
                            engineer.languages_known &&
                            engineer.languages_known.length > 0
                                ? engineer.languages_known.join(', ')
                                : null
                        }
                    />
                    <DetailField label="Created" value={engineer.created_at} />
                </div>

                <div className="mt-6 border-t border-[var(--color-border)] pt-6">
                    <p className="mb-4 text-xs font-semibold tracking-wide text-[var(--color-ink)]/55 uppercase">
                        Contact & Address
                    </p>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <DetailField
                            label="Mobile Number"
                            value={engineer.mobile_number}
                        />
                        <DetailField
                            label="Alternate Mobile Number"
                            value={engineer.alternate_mobile_number}
                        />
                        <DetailField
                            label="Official Email"
                            value={engineer.official_email}
                        />
                        <DetailField
                            label="Personal Email"
                            value={engineer.personal_email}
                        />
                        <DetailField label="City" value={engineer.city} />
                        <DetailField label="State" value={engineer.state} />
                        <DetailField
                            label="Postal Code"
                            value={engineer.postal_code}
                        />
                        <div className="sm:col-span-2">
                            <DetailField
                                label="Current Address"
                                value={engineer.current_address}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <DetailField
                                label="Permanent Address"
                                value={engineer.permanent_address}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t border-[var(--color-border)] pt-6">
                    <p className="mb-4 text-xs font-semibold tracking-wide text-[var(--color-ink)]/55 uppercase">
                        Identification
                    </p>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <DetailField
                            label="Aadhaar Number"
                            value={engineer.aadhaar_number}
                        />
                        <DetailField
                            label="PAN Number"
                            value={engineer.pan_number}
                        />
                    </div>
                </div>

                <div className="mt-6 border-t border-[var(--color-border)] pt-6">
                    <p className="mb-4 text-xs font-semibold tracking-wide text-[var(--color-ink)]/55 uppercase">
                        Bank Details
                    </p>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <DetailField
                            label="Bank Name"
                            value={engineer.bank_name}
                        />
                        <DetailField
                            label="Branch Name"
                            value={engineer.branch_name}
                        />
                        <DetailField
                            label="Account Number"
                            value={engineer.account_number}
                        />
                        <DetailField
                            label="IFSC Code"
                            value={engineer.ifsc_code}
                        />
                        <DetailField
                            label="PF Account Number"
                            value={engineer.pf_account_number}
                        />
                        <DetailField
                            label="ESI Account Number"
                            value={engineer.esi_account_number}
                        />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
