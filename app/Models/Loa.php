<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\LoaFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string|null $loa_number
 * @property Carbon|null $loa_date
 * @property string|null $client
 * @property int|null $vendor_id
 * @property int|null $division_id
 * @property int|null $schedule_name_id
 * @property int|null $schedule_type_id
 * @property string|null $work_type
 * @property string|null $contract_value_amount
 * @property string $contract_value_unit
 * @property int|null $completion_period_months
 * @property int|null $defect_liability_months
 * @property Carbon|null $start_date
 * @property Carbon|null $end_date
 * @property int|null $total_stations
 * @property Carbon|null $completion_date
 * @property Carbon|null $extension_date
 * @property string|null $scope_of_work
 * @property bool $active_status
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
 * @property-read Division|null $division
 * @property-read ScheduleName|null $scheduleName
 * @property-read ScheduleType|null $scheduleType
 * @property-read Vendor|null $vendor
 * @property-read Collection<int, LoaTeamMember> $teamMembers
 * @property-read Collection<int, LoaItem> $items
 * @property-read Collection<int, LoaStation> $stations
 * @property-read Collection<int, LoaFinancialSecurity> $financialSecurities
 */
#[Fillable([
    'loa_number',
    'loa_date',
    'client',
    'vendor_id',
    'division_id',
    'schedule_name_id',
    'schedule_type_id',
    'work_type',
    'contract_value_amount',
    'contract_value_unit',
    'completion_period_months',
    'defect_liability_months',
    'start_date',
    'end_date',
    'total_stations',
    'completion_date',
    'extension_date',
    'scope_of_work',
    'active_status',
    'is_delete',
])]
class Loa extends Model
{
    /** @use HasFactory<LoaFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'loa_date' => 'date',
            'start_date' => 'date',
            'end_date' => 'date',
            'completion_date' => 'date',
            'extension_date' => 'date',
            'contract_value_amount' => 'decimal:2',
            'active_status' => 'boolean',
            'is_delete' => 'boolean',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Division, $this>
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
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

    /**
     * @return BelongsTo<Vendor, $this>
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * @return HasMany<LoaTeamMember, $this>
     */
    public function teamMembers(): HasMany
    {
        return $this->hasMany(LoaTeamMember::class)->orderBy('order_no');
    }

    /**
     * @return HasMany<LoaItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(LoaItem::class)->orderBy('order_no');
    }

    /**
     * @return HasMany<LoaStation, $this>
     */
    public function stations(): HasMany
    {
        return $this->hasMany(LoaStation::class)->orderBy('order_no');
    }

    /**
     * @return HasMany<LoaFinancialSecurity, $this>
     */
    public function financialSecurities(): HasMany
    {
        return $this->hasMany(LoaFinancialSecurity::class);
    }
}
