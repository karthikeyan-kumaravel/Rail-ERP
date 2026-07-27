<?php

namespace Database\Factories;

use App\Models\LoaItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseOrderItem>
 */
class PurchaseOrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $orderedQty = fake()->randomFloat(3, 10, 500);
        $receivedQty = fake()->randomFloat(3, 0, (float) $orderedQty);
        $agreedRate = fake()->randomFloat(2, 500, 50000);
        $vendorQuotePrice = round($agreedRate * fake()->randomFloat(4, 0.9, 1.1), 2);
        $unitPriceExclGst = $agreedRate;
        $unitPriceInclGst = round($unitPriceExclGst * 1.18, 2);

        return [
            'purchase_order_id' => PurchaseOrder::factory(),
            'loa_item_id' => LoaItem::factory(),
            'ordered_qty' => $orderedQty,
            'received_qty' => $receivedQty,
            'balance_qty' => round($orderedQty - $receivedQty, 3),
            'unit_price_incl_gst' => $unitPriceInclGst,
            'unit_price_excl_gst' => $unitPriceExclGst,
            'agreed_rate' => $agreedRate,
            'total_price_incl_gst' => round($unitPriceInclGst * $orderedQty, 2),
            'total_price_excl_gst' => round($unitPriceExclGst * $orderedQty, 2),
            'vendor_quote_price' => $vendorQuotePrice,
            'variance_percentage' => round((($vendorQuotePrice - $agreedRate) / $agreedRate) * 100, 2),
            'order_no' => 0,
        ];
    }
}
