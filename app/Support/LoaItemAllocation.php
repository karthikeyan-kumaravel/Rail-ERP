<?php

namespace App\Support;

use App\Models\LoaItem;
use App\Models\PurchaseOrderItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class LoaItemAllocation
{
    /**
     * The remaining orderable quantity for each given LOA line item — its
     * own `item_quantity` minus whatever every other active purchase
     * order's items have already claimed against it. Used both to render
     * "available qty" on the create/edit forms and to enforce the
     * allocation cap when a PO is saved, so both call sites agree on
     * exactly one definition of "available".
     *
     * $lock acquires a row lock on the LOA items themselves. Only pass
     * true when called from inside a DB transaction that is about to
     * write purchase order items — it's what closes the gap between two
     * concurrent submissions both reading "enough is available" before
     * either has written.
     *
     * @param  array<int, int>  $loaItemIds
     * @return Collection<int, float>
     */
    public static function availableQuantities(array $loaItemIds, ?int $excludePurchaseOrderId = null, bool $lock = false): Collection
    {
        if ($loaItemIds === []) {
            return collect();
        }

        $loaItemsQuery = LoaItem::query()->whereIn('id', $loaItemIds);

        if ($lock) {
            $loaItemsQuery->lockForUpdate();
        }

        $totalQuantities = $loaItemsQuery->pluck('item_quantity', 'id');

        $allocatedByOtherPurchaseOrders = PurchaseOrderItem::query()
            ->select('loa_item_id', DB::raw('SUM(ordered_qty) as allocated_qty'))
            ->whereIn('loa_item_id', $loaItemIds)
            ->whereHas('purchaseOrder', fn ($query) => $query->where('is_delete', false))
            ->when($excludePurchaseOrderId, fn ($query, int $id) => $query->where('purchase_order_id', '!=', $id))
            ->groupBy('loa_item_id')
            ->pluck('allocated_qty', 'loa_item_id');

        return collect($loaItemIds)->mapWithKeys(function (int $loaItemId) use ($totalQuantities, $allocatedByOtherPurchaseOrders) {
            $total = (float) ($totalQuantities[$loaItemId] ?? 0);
            $allocated = (float) ($allocatedByOtherPurchaseOrders[$loaItemId] ?? 0);

            return [$loaItemId => max(0.0, $total - $allocated)];
        });
    }
}
