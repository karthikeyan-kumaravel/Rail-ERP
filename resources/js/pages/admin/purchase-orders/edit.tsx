import { Link, useForm } from '@inertiajs/react';
import type { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { index, update } from '@/routes/admin/purchase-orders';
import PurchaseOrderFormFields from './purchase-order-form-fields';
import type {
    LoaItemOption,
    LoaOption,
    PaymentType,
    PurchaseOrderItemFormData,
    PurchaseOrderStatus,
    VendorOption,
} from './purchase-order-form-fields';

type EditPurchaseOrder = {
    unique_id: string;
    po_number: string;
    order_date: string;
    loa_id: number | null;
    loa_item_id: number | null;
    vendor_id: number | null;
    ordered_qty: number | string | null;
    received_qty: number | string | null;
    unit_price_incl_gst: number | string | null;
    unit_price_excl_gst: number | string | null;
    agreed_rate: number | string | null;
    total_price_incl_gst: number | string | null;
    total_price_excl_gst: number | string | null;
    vendor_quote_price: number | string | null;
    delivery_date: string;
    status: PurchaseOrderStatus;
    payment_type: PaymentType;
};

type EditProps = {
    purchaseOrder: EditPurchaseOrder;
    loas: LoaOption[];
    loa_items: LoaItemOption[];
    vendors: VendorOption[];
    status_options: PurchaseOrderStatus[];
    payment_type_options: PaymentType[];
};

export default function PurchaseOrdersEdit({
    purchaseOrder,
    loas,
    loa_items: loaItems,
    vendors,
    status_options: statusOptions,
    payment_type_options: paymentTypeOptions,
}: EditProps) {
    const { data, setData, put, processing, errors } =
        useForm<PurchaseOrderItemFormData>({
            po_number: purchaseOrder.po_number,
            order_date: purchaseOrder.order_date,
            loa_id: purchaseOrder.loa_id ?? '',
            loa_item_id: purchaseOrder.loa_item_id ?? '',
            vendor_id: purchaseOrder.vendor_id ?? '',
            ordered_qty: String(purchaseOrder.ordered_qty ?? ''),
            received_qty: String(purchaseOrder.received_qty ?? ''),
            unit_price_incl_gst: String(
                purchaseOrder.unit_price_incl_gst ?? '',
            ),
            unit_price_excl_gst: String(
                purchaseOrder.unit_price_excl_gst ?? '',
            ),
            agreed_rate: String(purchaseOrder.agreed_rate ?? ''),
            total_price_incl_gst: String(
                purchaseOrder.total_price_incl_gst ?? '',
            ),
            total_price_excl_gst: String(
                purchaseOrder.total_price_excl_gst ?? '',
            ),
            vendor_quote_price: String(purchaseOrder.vendor_quote_price ?? ''),
            delivery_date: purchaseOrder.delivery_date,
            status: purchaseOrder.status,
            payment_type: purchaseOrder.payment_type,
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        put(update.url(purchaseOrder.unique_id));
    };

    return (
        <AdminLayout
            title="Edit Purchase Order"
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
                        Edit {purchaseOrder.po_number}
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
                    loas={loas}
                    loaItems={loaItems}
                    vendors={vendors}
                    statusOptions={statusOptions}
                    paymentTypeOptions={paymentTypeOptions}
                />

                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
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
