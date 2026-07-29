<?php

namespace App\Models;

use Database\Factories\LoaItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $loa_id
 * @property int|null $schedule_name_id
 * @property int|null $schedule_type_id
 * @property string|null $schedule_name
 * @property string|null $schedule_advertised_value
 * @property string $item_no
 * @property string $item_description
 * @property string|null $item_category
 * @property string|null $specialization_file_path
 * @property string|null $specialization_original_file_name
 * @property string|null $item_code
 * @property string $item_quantity
 * @property string $quantity_unit
 * @property string $unit_rate
 * @property string|null $escalation
 * @property string $advertised_value
 * @property string $bid_rate
 * @property string|null $bid_rate_unit
 * @property string|null $bid_percentage_value
 * @property string $bid_amount
 * @property bool $rebate_enabled
 * @property string $rebate_percentage
 * @property string $rebate_amount
 * @property string $final_bid_amount
 * @property string|null $inspection_by
 * @property array<string, string>|null $payment_stages
 * @property int $order_no
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Loa $loa
 * @property-read ScheduleName|null $scheduleName
 * @property-read ScheduleType|null $scheduleType
 */
#[Fillable([
    'loa_id',
    'schedule_name_id',
    'schedule_type_id',
    'schedule_name',
    'schedule_advertised_value',
    'item_no',
    'item_description',
    'item_category',
    'specialization_file_path',
    'specialization_original_file_name',
    'item_code',
    'item_quantity',
    'quantity_unit',
    'unit_rate',
    'escalation',
    'advertised_value',
    'bid_rate',
    'bid_rate_unit',
    'bid_percentage_value',
    'bid_amount',
    'rebate_enabled',
    'rebate_percentage',
    'rebate_amount',
    'final_bid_amount',
    'inspection_by',
    'payment_stages',
    'order_no',
])]
class LoaItem extends Model
{
    /** @use HasFactory<LoaItemFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'schedule_advertised_value' => 'decimal:2',
            'item_quantity' => 'decimal:3',
            'unit_rate' => 'decimal:2',
            'escalation' => 'decimal:2',
            'advertised_value' => 'decimal:2',
            'bid_rate' => 'decimal:2',
            'bid_percentage_value' => 'decimal:4',
            'bid_amount' => 'decimal:2',
            'rebate_enabled' => 'boolean',
            'rebate_percentage' => 'decimal:2',
            'rebate_amount' => 'decimal:2',
            'final_bid_amount' => 'decimal:2',
            'payment_stages' => 'array',
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
     * @return BelongsTo<ScheduleName, $this>
     */
    public function scheduleName(): BelongsTo
    {
        return $this->belongsTo(ScheduleName::class);
    }

    /**
     * @return BelongsTo<ScheduleType, $this>
     */
    public function scheduleType(): BelongsTo
    {
        return $this->belongsTo(ScheduleType::class);
    }
}
