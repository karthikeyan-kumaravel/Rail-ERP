import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/vendors';
import VendorFormFields from './vendor-form-fields';
import type {
    DistrictOption,
    StateOption,
    VendorFormData,
} from './vendor-form-fields';

type CreateProps = {
    states: StateOption[];
    districts: DistrictOption[];
};

export default function VendorsCreate({ states, districts }: CreateProps) {
    const { data, setData, post, processing, errors } =
        useForm<VendorFormData>({
            company_name: '',
            name: '',
            contact_no: '',
            alternate_contact_no: '',
            email: '',
            gst_no: '',
            pan_no: '',
            pan_proof: null,
            pincode: '',
            state_id: '',
            district_id: '',
            zone_name: '',
            bank_name: '',
            branch_name: '',
            account_no: '',
            ifsc_code: '',
            account_holder_name: '',
            bank_proof: null,
            address: '',
            username: '',
            password: '',
            password_confirmation: '',
            active_status: '1',
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(store.url());
    };

    return (
        <AdminLayout
            title="Add Vendor"
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
                        Add New
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
                    passwordRequired
                />

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save'}
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
