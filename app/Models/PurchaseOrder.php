<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\PurchaseOrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $po_number
 * @property string $supplier
 * @property string $items_description
 * @property Carbon $order_date
 * @property string $amount
 * @property Carbon $delivery_date
 * @property string $payment_terms
 * @property int $total_qty
 * @property int $received_qty
 * @property string $inspection_status
 * @property string $dispatch_status
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
 */
#[Fillable([
    'po_number',
    'supplier',
    'items_description',
    'order_date',
    'amount',
    'delivery_date',
    'payment_terms',
    'total_qty',
    'received_qty',
    'inspection_status',
    'dispatch_status',
    'is_delete',
])]
class PurchaseOrder extends Model
{
    /** @use HasFactory<PurchaseOrderFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    /** @var array<int, string> */
    public const INSPECTION_STATUSES = ['pending', 'in_progress', 'passed', 'failed'];

    /** @var array<int, string> */
    public const DISPATCH_STATUSES = ['pending', 'partial', 'completed'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'delivery_date' => 'date',
            'amount' => 'decimal:2',
            'total_qty' => 'integer',
            'received_qty' => 'integer',
            'is_delete' => 'boolean',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }
}
