import { TrashIcon } from '@/lib/icons';
import {
    calculateBalanceQty,
    calculateVariancePercentage,
} from './purchase-order-form-fields';
import type {
    LoaItemOption,
    PurchaseOrderItemFormData,
} from './purchase-order-form-fields';

type PurchaseOrderItemsTableProps = {
    items: PurchaseOrderItemFormData[];
    loaItems: LoaItemOption[];
    onRemove: (index: number) => void;
};

const headers = [
    'LOA Line Item',
    'Ordered Qty',
    'Received Qty',
    'Balance Qty',
    'Unit Price (Incl. GST)',
    'Unit Price (Excl. GST)',
    'Agreed Rate',
    'Total Price (Incl. GST)',
    'Total Price (Excl. GST)',
    'Vendor Quote',
    'Variance %',
    'Action',
];

export default function PurchaseOrderItemsTable({
    items,
    loaItems,
    onRemove,
}: PurchaseOrderItemsTableProps) {
    if (items.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-6 py-10 text-center text-sm text-[var(--color-ink)]/55">
                No items added yet. Fill in the form above and click{' '}
                <span className="font-semibold">Add Item</span> to build the
                purchase order.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
            <table className="w-full min-w-360 text-left text-sm">
                <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-accent)]/10 text-[11px] tracking-wider text-[var(--color-accent)] uppercase">
                        {headers.map((header) => (
                            <th
                                key={header}
                                className="px-3 py-3 font-bold whitespace-nowrap"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        const loaItemName =
                            loaItems.find(
                                (loaItem) => loaItem.id === item.loa_item_id,
                            )?.name ?? '—';
                        const balanceQty = calculateBalanceQty(
                            item.ordered_qty,
                            item.received_qty,
                        );
                        const variancePercentage = calculateVariancePercentage(
                            item.vendor_quote_price,
                            item.agreed_rate,
                        );

                        return (
                            <tr
                                key={index}
                                className="border-b border-[var(--color-border-soft-2)] text-[var(--color-ink)]/80 transition last:border-b-0 hover:bg-[var(--color-surface-soft-2)]"
                            >
                                <td className="max-w-52 truncate px-3 py-3">
                                    {loaItemName}
                                </td>
                                <td className="px-3 py-3 text-right tabular-nums">
                                    {item.ordered_qty}
                                </td>
                                <td className="px-3 py-3 text-right tabular-nums">
                                    {item.received_qty}
                                </td>
                                <td className="px-3 py-3 text-right font-semibold tabular-nums">
                                    {balanceQty}
                                </td>
                                <td className="px-3 py-3 text-right tabular-nums">
                                    {item.unit_price_incl_gst}
                                </td>
                                <td className="px-3 py-3 text-right tabular-nums">
                                    {item.unit_price_excl_gst}
                                </td>
                                <td className="px-3 py-3 text-right tabular-nums">
                                    {item.agreed_rate}
                                </td>
                                <td className="px-3 py-3 text-right tabular-nums">
                                    {item.total_price_incl_gst}
                                </td>
                                <td className="px-3 py-3 text-right tabular-nums">
                                    {item.total_price_excl_gst}
                                </td>
                                <td className="px-3 py-3 text-right tabular-nums">
                                    {item.vendor_quote_price}
                                </td>
                                <td className="px-3 py-3 text-right font-semibold tabular-nums">
                                    {variancePercentage
                                        ? `${variancePercentage}%`
                                        : '—'}
                                </td>
                                <td className="px-3 py-3">
                                    <button
                                        type="button"
                                        onClick={() => onRemove(index)}
                                        title="Remove item"
                                        aria-label={`Remove item ${index + 1}`}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none"
                                    >
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
