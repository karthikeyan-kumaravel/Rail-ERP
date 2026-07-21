type InspectionStatus = 'pending' | 'in_progress' | 'passed' | 'failed';
type DispatchStatus = 'pending' | 'partial' | 'completed';

export type PurchaseOrderFormData = {
    po_number: string;
    supplier: string;
    items_description: string;
    order_date: string;
    amount: string;
    delivery_date: string;
    payment_terms: string;
    total_qty: string;
    received_qty: string;
    inspection_status: InspectionStatus;
    dispatch_status: DispatchStatus;
};

type StatusOptions = {
    inspection_status: InspectionStatus[];
    dispatch_status: DispatchStatus[];
};

type PurchaseOrderFormFieldsProps = {
    data: PurchaseOrderFormData;
    setData: <K extends keyof PurchaseOrderFormData>(
        key: K,
        value: PurchaseOrderFormData[K],
    ) => void;
    errors: Partial<Record<keyof PurchaseOrderFormData, string>>;
    statusOptions: StatusOptions;
};

const inspectionLabels: Record<InspectionStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    passed: 'Passed',
    failed: 'Failed',
};

const dispatchLabels: Record<DispatchStatus, string> = {
    pending: 'Pending',
    partial: 'Partial',
    completed: 'Completed',
};

const labelClass = 'mb-1.5 block text-sm font-medium text-[var(--color-ink)]/80';
const inputClass =
    'w-full rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] shadow-sm outline-none transition placeholder:text-[var(--color-ink)]/35 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20';
const errorInputClass =
    'border-red-400 focus:border-red-500 focus:ring-red-500/15';

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-xs text-red-600">{message}</p>;
}

export default function PurchaseOrderFormFields({
    data,
    setData,
    errors,
    statusOptions,
}: PurchaseOrderFormFieldsProps) {
    return (
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
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
                    required
                    placeholder="PO/2024/005"
                    className={`${inputClass} ${errors.po_number ? errorInputClass : ''}`}
                />
                <FieldError message={errors.po_number} />
            </div>

            <div>
                <label htmlFor="supplier" className={labelClass}>
                    OEM / Supplier <span className="text-red-500">*</span>
                </label>
                <input
                    id="supplier"
                    type="text"
                    value={data.supplier}
                    onChange={(event) =>
                        setData('supplier', event.target.value)
                    }
                    required
                    placeholder="Supplier or OEM name"
                    className={`${inputClass} ${errors.supplier ? errorInputClass : ''}`}
                />
                <FieldError message={errors.supplier} />
            </div>

            <div className="sm:col-span-2">
                <label htmlFor="items_description" className={labelClass}>
                    Items Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="items_description"
                    value={data.items_description}
                    onChange={(event) =>
                        setData('items_description', event.target.value)
                    }
                    required
                    rows={2}
                    placeholder="Describe the ordered items and specifications"
                    className={`${inputClass} resize-y ${errors.items_description ? errorInputClass : ''}`}
                />
                <FieldError message={errors.items_description} />
            </div>

            <div>
                <label htmlFor="order_date" className={labelClass}>
                    Order Date <span className="text-red-500">*</span>
                </label>
                <input
                    id="order_date"
                    type="date"
                    value={data.order_date}
                    onChange={(event) =>
                        setData('order_date', event.target.value)
                    }
                    required
                    className={`${inputClass} ${errors.order_date ? errorInputClass : ''}`}
                />
                <FieldError message={errors.order_date} />
            </div>

            <div>
                <label htmlFor="amount" className={labelClass}>
                    Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={data.amount}
                    onChange={(event) =>
                        setData('amount', event.target.value)
                    }
                    required
                    placeholder="0.00"
                    className={`${inputClass} ${errors.amount ? errorInputClass : ''}`}
                />
                <FieldError message={errors.amount} />
            </div>

            <div>
                <label htmlFor="delivery_date" className={labelClass}>
                    Delivery Date <span className="text-red-500">*</span>
                </label>
                <input
                    id="delivery_date"
                    type="date"
                    value={data.delivery_date}
                    onChange={(event) =>
                        setData('delivery_date', event.target.value)
                    }
                    required
                    min={data.order_date || undefined}
                    className={`${inputClass} ${errors.delivery_date ? errorInputClass : ''}`}
                />
                <FieldError message={errors.delivery_date} />
            </div>

            <div>
                <label htmlFor="payment_terms" className={labelClass}>
                    Payment Terms <span className="text-red-500">*</span>
                </label>
                <input
                    id="payment_terms"
                    type="text"
                    value={data.payment_terms}
                    onChange={(event) =>
                        setData('payment_terms', event.target.value)
                    }
                    required
                    placeholder="30 days credit"
                    className={`${inputClass} ${errors.payment_terms ? errorInputClass : ''}`}
                />
                <FieldError message={errors.payment_terms} />
            </div>

            <div>
                <label htmlFor="total_qty" className={labelClass}>
                    Total Qty <span className="text-red-500">*</span>
                </label>
                <input
                    id="total_qty"
                    type="number"
                    min="0"
                    step="1"
                    value={data.total_qty}
                    onChange={(event) =>
                        setData('total_qty', event.target.value)
                    }
                    required
                    className={`${inputClass} ${errors.total_qty ? errorInputClass : ''}`}
                />
                <FieldError message={errors.total_qty} />
            </div>

            <div>
                <label htmlFor="received_qty" className={labelClass}>
                    Received Qty <span className="text-red-500">*</span>
                </label>
                <input
                    id="received_qty"
                    type="number"
                    min="0"
                    max={data.total_qty || undefined}
                    step="1"
                    value={data.received_qty}
                    onChange={(event) =>
                        setData('received_qty', event.target.value)
                    }
                    required
                    className={`${inputClass} ${errors.received_qty ? errorInputClass : ''}`}
                />
                <FieldError message={errors.received_qty} />
            </div>

            <div>
                <label htmlFor="inspection_status" className={labelClass}>
                    Inspection <span className="text-red-500">*</span>
                </label>
                <select
                    id="inspection_status"
                    value={data.inspection_status}
                    onChange={(event) =>
                        setData(
                            'inspection_status',
                            event.target.value as InspectionStatus,
                        )
                    }
                    required
                    className={`${inputClass} ${errors.inspection_status ? errorInputClass : ''}`}
                >
                    {statusOptions.inspection_status.map((status) => (
                        <option key={status} value={status}>
                            {inspectionLabels[status]}
                        </option>
                    ))}
                </select>
                <FieldError message={errors.inspection_status} />
            </div>

            <div>
                <label htmlFor="dispatch_status" className={labelClass}>
                    Dispatch <span className="text-red-500">*</span>
                </label>
                <select
                    id="dispatch_status"
                    value={data.dispatch_status}
                    onChange={(event) =>
                        setData(
                            'dispatch_status',
                            event.target.value as DispatchStatus,
                        )
                    }
                    required
                    className={`${inputClass} ${errors.dispatch_status ? errorInputClass : ''}`}
                >
                    {statusOptions.dispatch_status.map((status) => (
                        <option key={status} value={status}>
                            {dispatchLabels[status]}
                        </option>
                    ))}
                </select>
                <FieldError message={errors.dispatch_status} />
            </div>
        </div>
    );
}
