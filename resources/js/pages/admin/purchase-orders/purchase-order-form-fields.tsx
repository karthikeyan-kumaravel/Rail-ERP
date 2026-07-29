import NumericInput from '@/lib/numeric-input';
import SearchableSelect from '@/lib/searchable-select';
import type { SearchableSelectOption } from '@/lib/searchable-select';

export type PurchaseOrderStatus =
    'Not Placed' | 'Placed' | 'Partially Received' | 'Fully Received';

export type PaymentType = 'Advance' | 'Cash' | 'LC' | 'Part Payment';

export type LoaOption = SearchableSelectOption;
export type VendorOption = SearchableSelectOption;

export type LoaItemOption = SearchableSelectOption & {
    loa_id: number;
    quantity_unit: string;
    agreed_rate: string;
    available_qty: string;
};

export type PurchaseOrderHeaderFormData = {
    po_number: string;
    order_date: string;
    loa_id: number | '';
    vendor_id: number | '';
    delivery_date: string;
    status: PurchaseOrderStatus;
    payment_type: PaymentType;
};

export type PurchaseOrderItemFormData = {
    loa_item_id: number | '';
    ordered_qty: string;
    received_qty: string;
    unit_price_incl_gst: string;
    unit_price_excl_gst: string;
    agreed_rate: string;
    total_price_incl_gst: string;
    total_price_excl_gst: string;
    vendor_quote_price: string;
};

export function defaultPurchaseOrderHeader(): PurchaseOrderHeaderFormData {
    return {
        po_number: '',
        order_date: '',
        loa_id: '',
        vendor_id: '',
        delivery_date: '',
        status: 'Not Placed',
        payment_type: 'Advance',
    };
}

export function defaultPurchaseOrderItem(): PurchaseOrderItemFormData {
    return {
        loa_item_id: '',
        ordered_qty: '',
        received_qty: '',
        unit_price_incl_gst: '',
        unit_price_excl_gst: '',
        agreed_rate: '',
        total_price_incl_gst: '',
        total_price_excl_gst: '',
        vendor_quote_price: '',
    };
}

/** Balance Qty = Ordered Qty − Received Qty, formatted to 3 decimals. */
export function calculateBalanceQty(
    orderedQty: string,
    receivedQty: string,
): string {
    const ordered = Number(orderedQty);
    const received = Number(receivedQty);

    if (!Number.isFinite(ordered) || !Number.isFinite(received)) {
        return '';
    }

    return (ordered - received).toFixed(3);
}

/** Variance % of the vendor's quoted price against the LOA's agreed rate. */
export function calculateVariancePercentage(
    vendorQuotePrice: string,
    agreedRate: string,
): string {
    const quote = Number(vendorQuotePrice);
    const rate = Number(agreedRate);

    if (!Number.isFinite(quote) || !Number.isFinite(rate) || rate === 0) {
        return '';
    }

    return (((quote - rate) / rate) * 100).toFixed(2);
}

/**
 * The `available_qty` on each `LoaItemOption` is a snapshot computed by the
 * server when the page loaded — LOA quantity minus whatever other active
 * POs already ordered. It does not know about items the user has since
 * added to (or removed from) the PO Items table in this same form session.
 * This re-derives the true remaining quantity by further subtracting
 * whatever's already committed to `items` for that same LOA line item, so
 * the figure stays correct as items are added/removed before Save.
 */
export function computeEffectiveLoaItems(
    loaItems: LoaItemOption[],
    items: PurchaseOrderItemFormData[],
): LoaItemOption[] {
    const allocatedInItems = new Map<number, number>();

    items.forEach((item) => {
        if (item.loa_item_id === '') {
            return;
        }

        const orderedQty = Number(item.ordered_qty);

        if (!Number.isFinite(orderedQty)) {
            return;
        }

        allocatedInItems.set(
            item.loa_item_id,
            (allocatedInItems.get(item.loa_item_id) ?? 0) + orderedQty,
        );
    });

    return loaItems.map((loaItem) => {
        const alreadyInItems = allocatedInItems.get(loaItem.id) ?? 0;
        const availableQty = Math.max(
            0,
            Number(loaItem.available_qty) - alreadyInItems,
        );

        return { ...loaItem, available_qty: String(availableQty) };
    });
}

export const REQUIRED_ITEM_FIELDS: Array<{
    field: keyof PurchaseOrderItemFormData;
    label: string;
}> = [
    { field: 'loa_item_id', label: 'LOA Line Item' },
    { field: 'ordered_qty', label: 'Ordered Qty' },
    { field: 'received_qty', label: 'Received Qty' },
    { field: 'unit_price_incl_gst', label: 'Unit Price (Incl. GST)' },
    { field: 'unit_price_excl_gst', label: 'Unit Price (Excl. GST)' },
    { field: 'agreed_rate', label: 'Agreed Rate' },
    { field: 'total_price_incl_gst', label: 'Total Price (Incl. GST)' },
    { field: 'total_price_excl_gst', label: 'Total Price (Excl. GST)' },
    { field: 'vendor_quote_price', label: 'Incoming Price Capture' },
];

export function validatePurchaseOrderItemDraft(
    draft: PurchaseOrderItemFormData,
    loaItems: LoaItemOption[],
): Partial<Record<keyof PurchaseOrderItemFormData, string>> {
    const errors: Partial<Record<keyof PurchaseOrderItemFormData, string>> = {};

    REQUIRED_ITEM_FIELDS.forEach(({ field, label }) => {
        if (draft[field] === '' || draft[field] === null) {
            errors[field] = `${label} is required.`;
        }
    });

    if (draft.loa_item_id !== '') {
        const selected = loaItems.find((item) => item.id === draft.loa_item_id);
        const availableQty = Number(selected?.available_qty ?? 0);

        if (availableQty <= 0) {
            errors.loa_item_id =
                'No quantity is available for this LOA line item.';
        } else if (
            draft.ordered_qty !== '' &&
            Number.isFinite(Number(draft.ordered_qty)) &&
            Number(draft.ordered_qty) > availableQty
        ) {
            errors.ordered_qty = `Only ${availableQty} is available for this LOA line item.`;
        }
    }

    return errors;
}

export const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
    'Not Placed': 'Not Placed',
    Placed: 'Placed',
    'Partially Received': 'Partially Received',
    'Fully Received': 'Fully Received',
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
    Advance: 'Advance',
    Cash: 'Cash',
    LC: 'LC',
    'Part Payment': 'Part Payment',
};

export const labelClass =
    'mb-1.5 block text-sm font-medium text-[var(--color-ink)]/80';
export const inputClass =
    'w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] shadow-sm outline-none transition placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20';
export const readOnlyInputClass =
    'w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)]/70';
export const errorInputClass =
    'border-red-400 focus:border-red-500 focus:ring-red-500/15';

export function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-xs text-red-600">{message}</p>;
}

type PurchaseOrderHeaderFieldsProps = {
    data: PurchaseOrderHeaderFormData;
    setData: <K extends keyof PurchaseOrderHeaderFormData>(
        key: K,
        value: PurchaseOrderHeaderFormData[K],
    ) => void;
    errors: Partial<Record<keyof PurchaseOrderHeaderFormData, string>>;
    loas: LoaOption[];
    vendors: VendorOption[];
    statusOptions: PurchaseOrderStatus[];
    paymentTypeOptions: PaymentType[];
};

export function PurchaseOrderHeaderFields({
    data,
    setData,
    errors,
    loas,
    vendors,
    statusOptions,
    paymentTypeOptions,
}: PurchaseOrderHeaderFieldsProps) {
    return (
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
                <label htmlFor="loa_id" className={labelClass}>
                    LOA No. <span className="text-red-500">*</span>
                </label>
                <select
                    id="loa_id"
                    value={data.loa_id}
                    onChange={(event) =>
                        setData(
                            'loa_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={`${inputClass} ${errors.loa_id ? errorInputClass : ''}`}
                >
                    <option value="">Select LOA</option>
                    {loas.map((loa) => (
                        <option key={loa.id} value={loa.id}>
                            {loa.name}
                        </option>
                    ))}
                </select>
                <FieldError message={errors.loa_id} />
            </div>

            <div>
                <label htmlFor="po_number" className={labelClass}>
                    PO Number <span className="text-red-500">*</span>
                </label>
                <input
                    id="po_number"
                    type="text"
                    value={data.po_number}
                    onChange={(event) =>
                        setData('po_number', event.target.value)
                    }
                    placeholder="PO/2026/005"
                    className={`${inputClass} ${errors.po_number ? errorInputClass : ''}`}
                />
                <FieldError message={errors.po_number} />
            </div>

            <div>
                <label htmlFor="order_date" className={labelClass}>
                    PO Date <span className="text-red-500">*</span>
                </label>
                <input
                    id="order_date"
                    type="date"
                    value={data.order_date}
                    onChange={(event) =>
                        setData('order_date', event.target.value)
                    }
                    className={`${inputClass} ${errors.order_date ? errorInputClass : ''}`}
                />
                <FieldError message={errors.order_date} />
            </div>

            <div>
                <label htmlFor="vendor_id" className={labelClass}>
                    Vendor Name <span className="text-red-500">*</span>
                </label>
                <select
                    id="vendor_id"
                    value={data.vendor_id}
                    onChange={(event) =>
                        setData(
                            'vendor_id',
                            event.target.value
                                ? Number(event.target.value)
                                : '',
                        )
                    }
                    className={`${inputClass} ${errors.vendor_id ? errorInputClass : ''}`}
                >
                    <option value="">Select vendor</option>
                    {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                        </option>
                    ))}
                </select>
                <FieldError message={errors.vendor_id} />
            </div>

            <div>
                <label htmlFor="delivery_date" className={labelClass}>
                    Expected Delivery Date{' '}
                    <span className="text-red-500">*</span>
                </label>
                <input
                    id="delivery_date"
                    type="date"
                    value={data.delivery_date}
                    min={data.order_date || undefined}
                    onChange={(event) =>
                        setData('delivery_date', event.target.value)
                    }
                    className={`${inputClass} ${errors.delivery_date ? errorInputClass : ''}`}
                />
                <FieldError message={errors.delivery_date} />
            </div>

            <div>
                <label htmlFor="status" className={labelClass}>
                    Status <span className="text-red-500">*</span>
                </label>
                <select
                    id="status"
                    value={data.status}
                    onChange={(event) =>
                        setData(
                            'status',
                            event.target.value as PurchaseOrderStatus,
                        )
                    }
                    className={`${inputClass} ${errors.status ? errorInputClass : ''}`}
                >
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                        </option>
                    ))}
                </select>
                <FieldError message={errors.status} />
            </div>

            <div>
                <label htmlFor="payment_type" className={labelClass}>
                    Payment Type <span className="text-red-500">*</span>
                </label>
                <select
                    id="payment_type"
                    value={data.payment_type}
                    onChange={(event) =>
                        setData(
                            'payment_type',
                            event.target.value as PaymentType,
                        )
                    }
                    className={`${inputClass} ${errors.payment_type ? errorInputClass : ''}`}
                >
                    {paymentTypeOptions.map((paymentType) => (
                        <option key={paymentType} value={paymentType}>
                            {PAYMENT_TYPE_LABELS[paymentType]}
                        </option>
                    ))}
                </select>
                <FieldError message={errors.payment_type} />
            </div>
        </div>
    );
}

type PurchaseOrderItemFieldsProps = {
    data: PurchaseOrderItemFormData;
    setData: <K extends keyof PurchaseOrderItemFormData>(
        key: K,
        value: PurchaseOrderItemFormData[K],
    ) => void;
    errors: Partial<Record<keyof PurchaseOrderItemFormData, string>>;
    loaId: number | '';
    loaItems: LoaItemOption[];
};

export function PurchaseOrderItemFields({
    data,
    setData,
    errors,
    loaId,
    loaItems,
}: PurchaseOrderItemFieldsProps) {
    const visibleLoaItems = loaId
        ? loaItems.filter((item) => item.loa_id === loaId)
        : [];
    const selectedLoaItem = loaItems.find(
        (item) => item.id === data.loa_item_id,
    );

    const handleLoaItemChange = (value: number | '') => {
        setData('loa_item_id', value);

        const selected = loaItems.find((item) => item.id === value);

        setData('agreed_rate', selected?.agreed_rate ?? '');
        setData('ordered_qty', '');
    };

    const balanceQty = calculateBalanceQty(data.ordered_qty, data.received_qty);
    const variancePercentage = calculateVariancePercentage(
        data.vendor_quote_price,
        data.agreed_rate,
    );
    const availableQty = selectedLoaItem
        ? Number(selectedLoaItem.available_qty)
        : null;
    const isFullyAllocated = availableQty !== null && availableQty <= 0;

    return (
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
                <label htmlFor="loa_item_id" className={labelClass}>
                    LOA Line Item <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                    id="loa_item_id"
                    value={data.loa_item_id}
                    options={visibleLoaItems}
                    onChange={handleLoaItemChange}
                    placeholder={
                        loaId ? 'Search line items…' : 'Select an LOA first'
                    }
                    disabled={!loaId}
                />
                <FieldError message={errors.loa_item_id} />
            </div>

            <div>
                <label htmlFor="available_qty" className={labelClass}>
                    Available Qty
                </label>
                <input
                    id="available_qty"
                    type="text"
                    value={
                        selectedLoaItem
                            ? `${selectedLoaItem.available_qty} ${selectedLoaItem.quantity_unit}`.trim()
                            : ''
                    }
                    readOnly
                    disabled
                    placeholder="Select a line item"
                    className={readOnlyInputClass}
                />
                {isFullyAllocated && (
                    <FieldError message="No quantity remains available for this LOA line item." />
                )}
            </div>

            <div>
                <label htmlFor="ordered_qty" className={labelClass}>
                    Ordered Qty <span className="text-red-500">*</span>
                </label>
                <NumericInput
                    id="ordered_qty"
                    allowDecimal
                    min="0.001"
                    step="0.001"
                    max={selectedLoaItem?.available_qty || undefined}
                    value={data.ordered_qty}
                    disabled={!data.loa_item_id || isFullyAllocated}
                    onChange={(event) =>
                        setData('ordered_qty', event.target.value)
                    }
                    className={`${inputClass} ${errors.ordered_qty ? errorInputClass : ''}`}
                />
                <FieldError message={errors.ordered_qty} />
            </div>

            <div>
                <label htmlFor="received_qty" className={labelClass}>
                    Received Qty <span className="text-red-500">*</span>
                </label>
                <NumericInput
                    id="received_qty"
                    allowDecimal
                    min="0"
                    step="0.001"
                    value={data.received_qty}
                    onChange={(event) =>
                        setData('received_qty', event.target.value)
                    }
                    className={`${inputClass} ${errors.received_qty ? errorInputClass : ''}`}
                />
                <FieldError message={errors.received_qty} />
            </div>

            <div>
                <label htmlFor="balance_qty" className={labelClass}>
                    Balance Qty
                </label>
                <input
                    id="balance_qty"
                    type="text"
                    value={balanceQty}
                    readOnly
                    disabled
                    className={readOnlyInputClass}
                />
            </div>

            <div>
                <label htmlFor="unit_price_incl_gst" className={labelClass}>
                    Unit Price (Incl. GST){' '}
                    <span className="text-red-500">*</span>
                </label>
                <NumericInput
                    id="unit_price_incl_gst"
                    allowDecimal
                    min="0"
                    step="0.01"
                    value={data.unit_price_incl_gst}
                    onChange={(event) =>
                        setData('unit_price_incl_gst', event.target.value)
                    }
                    className={`${inputClass} ${errors.unit_price_incl_gst ? errorInputClass : ''}`}
                />
                <FieldError message={errors.unit_price_incl_gst} />
            </div>

            <div>
                <label htmlFor="unit_price_excl_gst" className={labelClass}>
                    Unit Price (Excl. GST){' '}
                    <span className="text-red-500">*</span>
                </label>
                <NumericInput
                    id="unit_price_excl_gst"
                    allowDecimal
                    min="0"
                    step="0.01"
                    value={data.unit_price_excl_gst}
                    onChange={(event) =>
                        setData('unit_price_excl_gst', event.target.value)
                    }
                    className={`${inputClass} ${errors.unit_price_excl_gst ? errorInputClass : ''}`}
                />
                <FieldError message={errors.unit_price_excl_gst} />
            </div>

            <div>
                <label htmlFor="agreed_rate" className={labelClass}>
                    Agreed Rate (LOA Rate){' '}
                    <span className="text-red-500">*</span>
                </label>
                <NumericInput
                    id="agreed_rate"
                    allowDecimal
                    min="0"
                    step="0.01"
                    value={data.agreed_rate}
                    onChange={(event) =>
                        setData('agreed_rate', event.target.value)
                    }
                    className={`${inputClass} ${errors.agreed_rate ? errorInputClass : ''}`}
                />
                <FieldError message={errors.agreed_rate} />
            </div>

            <div>
                <label htmlFor="total_price_incl_gst" className={labelClass}>
                    Total Price (Incl. GST){' '}
                    <span className="text-red-500">*</span>
                </label>
                <NumericInput
                    id="total_price_incl_gst"
                    allowDecimal
                    min="0"
                    step="0.01"
                    value={data.total_price_incl_gst}
                    onChange={(event) =>
                        setData('total_price_incl_gst', event.target.value)
                    }
                    className={`${inputClass} ${errors.total_price_incl_gst ? errorInputClass : ''}`}
                />
                <FieldError message={errors.total_price_incl_gst} />
            </div>

            <div>
                <label htmlFor="total_price_excl_gst" className={labelClass}>
                    Total Price (Excl. GST){' '}
                    <span className="text-red-500">*</span>
                </label>
                <NumericInput
                    id="total_price_excl_gst"
                    allowDecimal
                    min="0"
                    step="0.01"
                    value={data.total_price_excl_gst}
                    onChange={(event) =>
                        setData('total_price_excl_gst', event.target.value)
                    }
                    className={`${inputClass} ${errors.total_price_excl_gst ? errorInputClass : ''}`}
                />
                <FieldError message={errors.total_price_excl_gst} />
            </div>

            <div>
                <label htmlFor="vendor_quote_price" className={labelClass}>
                    Incoming Price Capture (Vendor Quote){' '}
                    <span className="text-red-500">*</span>
                </label>
                <NumericInput
                    id="vendor_quote_price"
                    allowDecimal
                    min="0"
                    step="0.01"
                    value={data.vendor_quote_price}
                    onChange={(event) =>
                        setData('vendor_quote_price', event.target.value)
                    }
                    className={`${inputClass} ${errors.vendor_quote_price ? errorInputClass : ''}`}
                />
                <FieldError message={errors.vendor_quote_price} />
            </div>

            <div>
                <label htmlFor="variance_percentage" className={labelClass}>
                    Variance %
                </label>
                <input
                    id="variance_percentage"
                    type="text"
                    value={variancePercentage ? `${variancePercentage}%` : ''}
                    readOnly
                    disabled
                    className={readOnlyInputClass}
                />
            </div>
        </div>
    );
}
