<?php

namespace App\Models;

use Database\Factories\PurchaseOrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $purchase_order_id
 * @property int|null $loa_item_id
 * @property string|null $ordered_qty
 * @property string|null $received_qty
 * @property string|null $balance_qty
 * @property string|null $unit_price_incl_gst
 * @property string|null $unit_price_excl_gst
 * @property string|null $agreed_rate
 * @property string|null $total_price_incl_gst
 * @property string|null $total_price_excl_gst
 * @property string|null $vendor_quote_price
 * @property string|null $variance_percentage
 * @property int $order_no
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read PurchaseOrder $purchaseOrder
 * @property-read LoaItem|null $loaItem
 */
#[Fillable([
    'purchase_order_id',
    'loa_item_id',
    'ordered_qty',
    'received_qty',
    'balance_qty',
    'unit_price_incl_gst',
    'unit_price_excl_gst',
    'agreed_rate',
    'total_price_incl_gst',
    'total_price_excl_gst',
    'vendor_quote_price',
    'variance_percentage',
    'order_no',
])]
class PurchaseOrderItem extends Model
{
    /** @use HasFactory<PurchaseOrderItemFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ordered_qty' => 'decimal:3',
            'received_qty' => 'decimal:3',
            'balance_qty' => 'decimal:3',
            'unit_price_incl_gst' => 'decimal:2',
            'unit_price_excl_gst' => 'decimal:2',
            'agreed_rate' => 'decimal:2',
            'total_price_incl_gst' => 'decimal:2',
            'total_price_excl_gst' => 'decimal:2',
            'vendor_quote_price' => 'decimal:2',
            'variance_percentage' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<PurchaseOrder, $this>
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * @return BelongsTo<LoaItem, $this>
     */
    public function loaItem(): BelongsTo
    {
        return $this->belongsTo(LoaItem::class);
    }
}
