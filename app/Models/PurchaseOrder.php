<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\PurchaseOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $po_number
 * @property Carbon $order_date
 * @property int|null $loa_id
 * @property int|null $loa_item_id
 * @property int|null $vendor_id
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
 * @property Carbon $delivery_date
 * @property string $status
 * @property string|null $payment_type
 * @property bool $is_delete
 * @property string|null $unique_id
 * @property string|null $acc_year
 * @property string|null $session_id
 * @property int|null $sess_user_type
 * @property int|null $sess_user_id
 * @property int|null $sess_company_id
 * @property int|null $sess_branch_id
 * @property Carbon|null $created
 * @property Carbon|null $updated
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Loa|null $loa
 * @property-read LoaItem|null $loaItem
 * @property-read Vendor|null $vendor
 */
#[Fillable([
    'po_number',
    'order_date',
    'loa_id',
    'loa_item_id',
    'vendor_id',
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
    'delivery_date',
    'status',
    'payment_type',
    'is_delete',
])]
class PurchaseOrder extends Model
{
    /** @use HasFactory<PurchaseOrderFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    /** @var array<int, string> */
    public const STATUSES = ['Not Placed', 'Placed', 'Partially Received', 'Fully Received'];

    /** @var array<int, string> */
    public const PAYMENT_TYPES = ['Advance', 'Cash', 'LC', 'Part Payment'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'delivery_date' => 'date',
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
            'is_delete' => 'boolean',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Loa, $this>
     */
    public function loa(): BelongsTo
    {
        return $this->belongsTo(Loa::class);
    }

    /**
     * @return BelongsTo<LoaItem, $this>
     */
    public function loaItem(): BelongsTo
    {
        return $this->belongsTo(LoaItem::class);
    }

    /**
     * @return BelongsTo<Vendor, $this>
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
