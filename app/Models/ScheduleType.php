<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\ScheduleTypeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $schedule_name_id
 * @property string $name
 * @property string $short_name
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
 * @property-read ScheduleName $scheduleName
 */
#[Fillable(['schedule_name_id', 'name', 'short_name', 'active_status', 'is_delete'])]
class ScheduleType extends Model
{
    /** @use HasFactory<ScheduleTypeFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'active_status' => 'boolean',
            'is_delete' => 'boolean',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<ScheduleName, $this>
     */
    public function scheduleName(): BelongsTo
    {
        return $this->belongsTo(ScheduleName::class);
    }
}
