<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\AlertFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $type
 * @property string $severity
 * @property string $title
 * @property string $description
 * @property string|null $alertable_type
 * @property int|null $alertable_id
 * @property Carbon|null $due_date
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
 * @property-read Model|null $alertable
 */
#[Fillable([
    'type',
    'severity',
    'title',
    'description',
    'alertable_type',
    'alertable_id',
    'due_date',
    'is_delete',
])]
class Alert extends Model
{
    /** @use HasFactory<AlertFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    public const string TYPE_LOA_COMPLETION_APPROACHING = 'loa_completion_approaching';

    public const string SEVERITY_CRITICAL = 'critical';

    public const string SEVERITY_WARNING = 'warning';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'is_delete' => 'boolean',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function alertable(): MorphTo
    {
        return $this->morphTo();
    }
}
