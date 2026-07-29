import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/banks';
import BankFormFields from './bank-form-fields';
import type { BankFormData } from './bank-form-fields';

type EditBank = {
    unique_id: string;
    name: string;
    branch_name: string;
    ifsc_code: string;
    account_number: string;
    account_holder_name: string;
    account_type: 'Savings' | 'Current';
    bank_address: string;
    pincode: string;
    contact_number: string;
    email: string;
    active_status: boolean;
};

type EditProps = {
    bank: EditBank;
};

export default function BanksEdit({ bank }: EditProps) {
    const { data, setData, put, processing, errors } = useForm<BankFormData>({
        name: bank.name,
        branch_name: bank.branch_name,
        ifsc_code: bank.ifsc_code,
        account_number: bank.account_number,
        account_holder_name: bank.account_holder_name,
        account_type: bank.account_type,
        bank_address: bank.bank_address,
        pincode: bank.pincode,
        contact_number: bank.contact_number,
        email: bank.email,
        active_status: bank.active_status ? '1' : '0',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(update.url(bank.unique_id));
    };

    return (
        <AdminLayout
            title="Edit Bank"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Admin / Settings / Bank
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
                <BankFormFields data={data} setData={setData} errors={errors} />

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save Changes'}
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
