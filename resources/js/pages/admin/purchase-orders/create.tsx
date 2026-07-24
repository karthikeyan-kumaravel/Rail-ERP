import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/purchase-orders';
import PurchaseOrderFormFields, {
    defaultPurchaseOrderItem,
    FieldError,
} from './purchase-order-form-fields';
import type {
    LoaItemOption,
    LoaOption,
    PaymentType,
    PurchaseOrderItemFormData,
    PurchaseOrderStatus,
    VendorOption,
} from './purchase-order-form-fields';
import PurchaseOrderItemsTable from './purchase-order-items-table';

type CreateProps = {
    loas: LoaOption[];
    loa_items: LoaItemOption[];
    vendors: VendorOption[];
    status_options: PurchaseOrderStatus[];
    payment_type_options: PaymentType[];
};

const requiredFields: Array<{
    field: keyof PurchaseOrderItemFormData;
    label: string;
}> = [
    { field: 'loa_id', label: 'LOA No.' },
    { field: 'po_number', label: 'PO Number' },
    { field: 'order_date', label: 'PO Date' },
    { field: 'loa_item_id', label: 'LOA Line Item' },
    { field: 'vendor_id', label: 'Vendor Name' },
    { field: 'received_qty', label: 'Received Qty' },
    { field: 'unit_price_incl_gst', label: 'Unit Price (Incl. GST)' },
    { field: 'unit_price_excl_gst', label: 'Unit Price (Excl. GST)' },
    { field: 'agreed_rate', label: 'Agreed Rate' },
    { field: 'total_price_incl_gst', label: 'Total Price (Incl. GST)' },
    { field: 'total_price_excl_gst', label: 'Total Price (Excl. GST)' },
    { field: 'vendor_quote_price', label: 'Incoming Price Capture' },
    { field: 'delivery_date', label: 'Expected Delivery Date' },
];

function validateDraft(
    draft: PurchaseOrderItemFormData,
): Partial<Record<keyof PurchaseOrderItemFormData, string>> {
    const errors: Partial<Record<keyof PurchaseOrderItemFormData, string>> = {};

    requiredFields.forEach(({ field, label }) => {
        if (draft[field] === '' || draft[field] === null) {
            errors[field] = `${label} is required.`;
        }
    });

    return errors;
}

export default function PurchaseOrdersCreate({
    loas,
    loa_items: loaItems,
    vendors,
    status_options: statusOptions,
    payment_type_options: paymentTypeOptions,
}: CreateProps) {
    const [draft, setDraftState] = useState<PurchaseOrderItemFormData>(
        defaultPurchaseOrderItem(),
    );
    const [draftErrors, setDraftErrors] = useState<
        Partial<Record<keyof PurchaseOrderItemFormData, string>>
    >({});

    const { data, setData, post, processing, errors } = useForm<{
        items: PurchaseOrderItemFormData[];
    }>({
        items: [],
    });

    const setDraft = <K extends keyof PurchaseOrderItemFormData>(
        key: K,
        value: PurchaseOrderItemFormData[K],
    ) => {
        setDraftState((current) => ({ ...current, [key]: value }));
    };

    const addItem = () => {
        const validationErrors = validateDraft(draft);

        if (Object.keys(validationErrors).length > 0) {
            setDraftErrors(validationErrors);

            return;
        }

        setDraftErrors({});
        setData('items', [...data.items, draft]);
        setDraftState({
            ...defaultPurchaseOrderItem(),
            po_number: draft.po_number,
            order_date: draft.order_date,
        });
    };

    const removeItem = (index: number) => {
        setData(
            'items',
            data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

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
            <form onSubmit={submit} noValidate className="space-y-5">
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-xl backdrop-blur-sm">
                    <h2 className="mb-4 text-base font-bold text-[var(--color-ink)]">
                        Item Details
                    </h2>
                    <PurchaseOrderFormFields
                        data={draft}
                        setData={setDraft}
                        errors={draftErrors}
                        loas={loas}
                        loaItems={loaItems}
                        vendors={vendors}
                        statusOptions={statusOptions}
                        paymentTypeOptions={paymentTypeOptions}
                    />

                    <div className="mt-5">
                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/20"
                        >
                            <span className="text-lg leading-none">+</span>
                            Add Item
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-xl backdrop-blur-sm">
                    <h2 className="mb-4 text-base font-bold text-[var(--color-ink)]">
                        Items Added ({data.items.length})
                    </h2>
                    <PurchaseOrderItemsTable
                        items={data.items}
                        loas={loas}
                        loaItems={loaItems}
                        vendors={vendors}
                        onRemove={removeItem}
                    />
                    <FieldError message={errors.items} />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing || data.items.length === 0}
                        className="inline-flex min-w-24 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? 'Saving...' : 'Save'}
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
