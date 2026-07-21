import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/purchase-orders';
import PurchaseOrderFormFields from './purchase-order-form-fields';
import type { PurchaseOrderFormData } from './purchase-order-form-fields';

type InspectionStatus = 'pending' | 'in_progress' | 'passed' | 'failed';
type DispatchStatus = 'pending' | 'partial' | 'completed';

type CreateProps = {
    status_options: {
        inspection_status: InspectionStatus[];
        dispatch_status: DispatchStatus[];
    };
};

export default function PurchaseOrdersCreate({ status_options }: CreateProps) {
    const { data, setData, post, processing, errors } =
        useForm<PurchaseOrderFormData>({
            po_number: '',
            supplier: '',
            items_description: '',
            order_date: '',
            amount: '',
            delivery_date: '',
            payment_terms: '30 days credit',
            total_qty: '0',
            received_qty: '0',
            inspection_status: 'pending',
            dispatch_status: 'pending',
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(store.url());
    };

    return (
        <AdminLayout
            title="New Purchase Order"
            withBackgroundImage
            header={
                <div className="text-sm">
                    <Link
                        href={index.url()}
                        className="text-[var(--color-ink)]/55 hover:text-[var(--color-accent)]"
                    >
                        Project Setup / Purchase Orders
                    </Link>
                    <span className="mx-1.5 text-[var(--color-ink)]/40">/</span>
                    <span className="font-semibold text-[var(--color-ink)]">
                        New Purchase Order
                    </span>
                </div>
            }
        >
            <form
                onSubmit={submit}
                noValidate
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-xl backdrop-blur-sm"
            >
                <PurchaseOrderFormFields
                    data={data}
                    setData={setData}
                    errors={errors}
                    statusOptions={status_options}
                />

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex min-w-24 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save PO'}
                    </button>
                    <Link
                        href={index.url()}
                        className="rounded-lg border border-[var(--color-border-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]/80 transition hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
