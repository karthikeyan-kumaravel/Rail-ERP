<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\PurchaseOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $po_number
 * @property Carbon $order_date
 * @property int|null $loa_id
 * @property int|null $vendor_id
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
 * @property-read Vendor|null $vendor
 * @property-read Collection<int, PurchaseOrderItem> $items
 * @property-read int|null $items_count
 * @property-read string|null $total_ordered_qty
 * @property-read string|null $total_received_qty
 * @property-read string|null $total_value_incl_gst
 */
#[Fillable([
    'po_number',
    'order_date',
    'loa_id',
    'vendor_id',
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
     * @return BelongsTo<Vendor, $this>
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * @return HasMany<PurchaseOrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class)->orderBy('order_no');
    }
}
