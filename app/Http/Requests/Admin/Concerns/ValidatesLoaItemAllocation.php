<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Support\LoaItemAllocation;
use Illuminate\Validation\Validator;

trait ValidatesLoaItemAllocation
{
    /**
     * Ensures no LOA line item's total requested ordered quantity — summed
     * across every item in this submission plus every other active PO's
     * items — exceeds what the LOA line item actually has available.
     * $excludePurchaseOrderId lets an edit exclude its own already-persisted
     * items from the "other POs" side of the check, so re-saving an
     * unchanged PO doesn't double-count its own allocation.
     *
     * This is a fast, unlocked read for immediate form feedback — it can
     * still race against another concurrent submission. The authoritative
     * check happens again with a row lock inside the controller's write
     * transaction (see LoaItemAllocation::availableQuantities($lock: true)).
     *
     * @param  array<int, array{loa_item_id?: mixed, ordered_qty?: mixed}>  $items
     */
    protected function validateLoaItemAllocation(Validator $validator, array $items, ?int $excludePurchaseOrderId): void
    {
        $requestedByLoaItem = [];

        foreach ($items as $index => $item) {
            $loaItemId = $item['loa_item_id'] ?? null;

            if (! $loaItemId || ! is_numeric($item['ordered_qty'] ?? null)) {
                continue;
            }

            $requestedByLoaItem[$loaItemId]['qty'] = ($requestedByLoaItem[$loaItemId]['qty'] ?? 0) + (float) $item['ordered_qty'];
            $requestedByLoaItem[$loaItemId]['indexes'][] = $index;
        }

        if ($requestedByLoaItem === []) {
            return;
        }

        $availableByLoaItem = LoaItemAllocation::availableQuantities(
            array_keys($requestedByLoaItem),
            $excludePurchaseOrderId,
        );

        foreach ($requestedByLoaItem as $loaItemId => $requested) {
            $availableQty = (float) ($availableByLoaItem[$loaItemId] ?? 0.0);

            if ($requested['qty'] > $availableQty) {
                foreach ($requested['indexes'] as $index) {
                    $validator->errors()->add(
                        "items.{$index}.ordered_qty",
                        sprintf('Only %s is available for this LOA line item.', number_format($availableQty, 3)),
                    );
                }
            }
        }
    }
}
