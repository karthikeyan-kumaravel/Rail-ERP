import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/vendors';
import VendorFormFields from './vendor-form-fields';
import type {
    DistrictOption,
    StateOption,
    VendorFormData,
} from './vendor-form-fields';

type EditVendor = {
    unique_id: string;
    company_name: string;
    name: string;
    contact_no: string;
    alternate_contact_no: string | null;
    email: string | null;
    gst_no: string | null;
    pan_no: string;
    pincode: string;
    state_id: number | null;
    district_id: number | null;
    zone_name: string | null;
    bank_name: string;
    branch_name: string | null;
    account_no: string;
    ifsc_code: string;
    account_holder_name: string;
    address: string;
    username: string | null;
    active_status: boolean;
    pan_proof_url: string;
    bank_proof_url: string;
};

type EditProps = {
    vendor: EditVendor;
    states: StateOption[];
    districts: DistrictOption[];
};

export default function VendorsEdit({ vendor, states, districts }: EditProps) {
    const { data, setData, put, processing, errors } = useForm<VendorFormData>({
        company_name: vendor.company_name,
        name: vendor.name,
        contact_no: vendor.contact_no,
        alternate_contact_no: vendor.alternate_contact_no ?? '',
        email: vendor.email ?? '',
        gst_no: vendor.gst_no ?? '',
        pan_no: vendor.pan_no,
        pan_proof: null,
        pincode: vendor.pincode,
        state_id: vendor.state_id ?? '',
        district_id: vendor.district_id ?? '',
        zone_name: vendor.zone_name ?? '',
        bank_name: vendor.bank_name,
        branch_name: vendor.branch_name ?? '',
        account_no: vendor.account_no,
        ifsc_code: vendor.ifsc_code,
        account_holder_name: vendor.account_holder_name,
        bank_proof: null,
        address: vendor.address,
        username: vendor.username ?? '',
        password: '',
        password_confirmation: '',
        active_status: vendor.active_status ? '1' : '0',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(update.url(vendor.unique_id));
    };

    return (
        <AdminLayout
            title="Edit Vendor"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / Settings / Vendor
                    </Link>
                    <span className="mx-1.5 text-[var(--color-ink)]/40">/</span>
                    <span className="font-semibold text-[var(--color-ink)]">
                        Edit
                    </span>
                </div>
            }
        >
            <form
                onSubmit={submit}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm sm:p-6"
            >
                <div className="mb-4 flex items-center justify-end">
                    <span className="text-xs font-medium text-[var(--color-accent)]">
                        * Mandatory Fields
                    </span>
                </div>

                <VendorFormFields
                    data={data}
                    setData={setData}
                    errors={errors}
                    states={states}
                    districts={districts}
                    passwordRequired={false}
                    existingPanProofUrl={vendor.pan_proof_url}
                    existingBankProofUrl={vendor.bank_proof_url}
                />

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save changes'}
                    </button>
                    <Link
                        href={index.url()}
                        className="rounded-lg border border-[var(--color-gold)]/25 px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
