import { Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, store } from '@/routes/admin/purchase-orders';
import {
    computeEffectiveLoaItems,
    defaultPurchaseOrderHeader,
    defaultPurchaseOrderItem,
    FieldError,
    PurchaseOrderHeaderFields,
    PurchaseOrderItemFields,
    validatePurchaseOrderItemDraft,
} from './purchase-order-form-fields';
import type {
    LoaItemOption,
    LoaOption,
    PaymentType,
    PurchaseOrderHeaderFormData,
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

export default function PurchaseOrdersCreate({
    loas,
    loa_items: loaItems,
    vendors,
    status_options: statusOptions,
    payment_type_options: paymentTypeOptions,
}: CreateProps) {
    const { data, setData, post, processing, errors } = useForm<
        PurchaseOrderHeaderFormData & { items: PurchaseOrderItemFormData[] }
    >({
        ...defaultPurchaseOrderHeader(),
        items: [],
    });

    const [itemDraft, setItemDraftState] = useState<PurchaseOrderItemFormData>(
        defaultPurchaseOrderItem(),
    );
    const [itemDraftErrors, setItemDraftErrors] = useState<
        Partial<Record<keyof PurchaseOrderItemFormData, string>>
    >({});

    const effectiveLoaItems = useMemo(
        () => computeEffectiveLoaItems(loaItems, data.items),
        [loaItems, data.items],
    );

    const setHeaderField = <K extends keyof PurchaseOrderHeaderFormData>(
        key: K,
        value: PurchaseOrderHeaderFormData[K],
    ) => {
        setData((current) => ({
            ...current,
            [key]: value,
            items: key === 'loa_id' ? [] : current.items,
        }));

        if (key === 'loa_id') {
            setItemDraftState(defaultPurchaseOrderItem());
            setItemDraftErrors({});
        }
    };

    const setItemDraft = <K extends keyof PurchaseOrderItemFormData>(
        key: K,
        value: PurchaseOrderItemFormData[K],
    ) => {
        setItemDraftState((current) => ({ ...current, [key]: value }));
    };

    const addItem = () => {
        const validationErrors = validatePurchaseOrderItemDraft(
            itemDraft,
            effectiveLoaItems,
        );

        if (Object.keys(validationErrors).length > 0) {
            setItemDraftErrors(validationErrors);

            return;
        }

        setItemDraftErrors({});
        setData('items', [...data.items, itemDraft]);
        setItemDraftState(defaultPurchaseOrderItem());
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

    const itemErrors = Object.entries(errors).filter(([key]) =>
        key.startsWith('items.'),
    );

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
                        Purchase Order Details
                    </h2>
                    <PurchaseOrderHeaderFields
                        data={data}
                        setData={setHeaderField}
                        errors={errors}
                        loas={loas}
                        vendors={vendors}
                        statusOptions={statusOptions}
                        paymentTypeOptions={paymentTypeOptions}
                    />
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/95 p-6 shadow-xl backdrop-blur-sm">
                    <h2 className="mb-4 text-base font-bold text-[var(--color-ink)]">
                        Item Details
                    </h2>
                    <PurchaseOrderItemFields
                        data={itemDraft}
                        setData={setItemDraft}
                        errors={itemDraftErrors}
                        loaId={data.loa_id}
                        loaItems={effectiveLoaItems}
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
                        loaItems={loaItems}
                        onRemove={removeItem}
                    />
                    <FieldError message={errors.items} />
                    {itemErrors.map(([key, message]) => (
                        <FieldError key={key} message={message} />
                    ))}
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
