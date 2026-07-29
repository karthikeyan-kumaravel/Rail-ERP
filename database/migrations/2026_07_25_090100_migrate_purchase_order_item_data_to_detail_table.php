<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * store() previously created one flat `purchase_orders` row per added
     * grid item, all sharing the same `po_number` — so each existing
     * `po_number` group already represents one logical PO. This keeps the
     * earliest row per group as the PO header and moves every group
     * member's item-level columns into `purchase_order_items`, then removes
     * the now-redundant duplicate header rows.
     */
    public function up(): void
    {
        $rows = DB::table('purchase_orders')->orderBy('po_number')->orderBy('id')->get();

        $itemInserts = [];
        $extraHeaderIds = [];

        foreach ($rows->groupBy('po_number') as $group) {
            $header = $group->first();

            foreach ($group->values() as $index => $row) {
                $itemInserts[] = [
                    'purchase_order_id' => $header->id,
                    'loa_item_id' => $row->loa_item_id,
                    'ordered_qty' => $row->ordered_qty,
                    'received_qty' => $row->received_qty,
                    'balance_qty' => $row->balance_qty,
                    'unit_price_incl_gst' => $row->unit_price_incl_gst,
                    'unit_price_excl_gst' => $row->unit_price_excl_gst,
                    'agreed_rate' => $row->agreed_rate,
                    'total_price_incl_gst' => $row->total_price_incl_gst,
                    'total_price_excl_gst' => $row->total_price_excl_gst,
                    'vendor_quote_price' => $row->vendor_quote_price,
                    'variance_percentage' => $row->variance_percentage,
                    'order_no' => $index,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ];

                if ($row->id !== $header->id) {
                    $extraHeaderIds[] = $row->id;
                }
            }
        }

        foreach (array_chunk($itemInserts, 500) as $chunk) {
            DB::table('purchase_order_items')->insert($chunk);
        }

        if ($extraHeaderIds !== []) {
            DB::table('purchase_orders')->whereIn('id', $extraHeaderIds)->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('purchase_order_items')->truncate();
    }
};
