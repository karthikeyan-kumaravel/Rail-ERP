<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\LoaFinancialSecurityFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $loa_id
 * @property string $security_type
 * @property string|null $amount
 * @property string $amount_unit
 * @property Carbon|null $validity_start_date
 * @property Carbon|null $validity_end_date
 * @property int|null $claim_period
 * @property string $claim_period_unit
 * @property int|null $bank_id
 * @property string|null $file_path
 * @property string|null $original_file_name
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
 * @property-read Loa $loa
 * @property-read Bank|null $bank
 */
#[Fillable([
    'loa_id',
    'security_type',
    'amount',
    'amount_unit',
    'validity_start_date',
    'validity_end_date',
    'claim_period',
    'claim_period_unit',
    'bank_id',
    'file_path',
    'original_file_name',
    'is_delete',
])]
class LoaFinancialSecurity extends Model
{
    /** @use HasFactory<LoaFinancialSecurityFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    public const string TYPE_EMD = 'emd';

    public const string TYPE_PERFORMANCE_BG = 'performance_bg';

    public const string TYPE_SECURITY_BG = 'security_bg';

    /**
     * @var array<int, string>
     */
    public const array TYPES = [
        self::TYPE_EMD,
        self::TYPE_PERFORMANCE_BG,
        self::TYPE_SECURITY_BG,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'validity_start_date' => 'date',
            'validity_end_date' => 'date',
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
     * @return BelongsTo<Bank, $this>
     */
    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
    }
}
