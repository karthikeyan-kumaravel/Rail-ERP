<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\EngineerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $employee_code
 * @property string|null $full_name
 * @property string|null $gender
 * @property Carbon|null $date_of_birth
 * @property string|null $blood_group
 * @property string|null $nationality
 * @property string|null $marital_status
 * @property string|null $mobile_number
 * @property string|null $alternate_mobile_number
 * @property string|null $official_email
 * @property string|null $personal_email
 * @property string|null $current_address
 * @property string|null $permanent_address
 * @property int|null $city_id
 * @property int|null $state_id
 * @property string|null $postal_code
 * @property string|null $aadhaar_number
 * @property string|null $pan_number
 * @property Carbon|null $date_of_joining
 * @property string $employee_status
 * @property int|null $engineer_type_id
 * @property string|null $bank_name
 * @property string|null $branch_name
 * @property string|null $account_number
 * @property string|null $ifsc_code
 * @property string|null $pf_account_number
 * @property string|null $esi_account_number
 * @property array<int, string>|null $languages_known
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
 * @property-read City|null $city
 * @property-read State|null $state
 * @property-read EngineerType|null $engineerType
 */
#[Fillable([
    'employee_code',
    'full_name',
    'gender',
    'date_of_birth',
    'blood_group',
    'nationality',
    'marital_status',
    'mobile_number',
    'alternate_mobile_number',
    'official_email',
    'personal_email',
    'current_address',
    'permanent_address',
    'city_id',
    'state_id',
    'postal_code',
    'aadhaar_number',
    'pan_number',
    'date_of_joining',
    'employee_status',
    'engineer_type_id',
    'bank_name',
    'branch_name',
    'account_number',
    'ifsc_code',
    'pf_account_number',
    'esi_account_number',
    'languages_known',
    'is_delete',
])]
class Engineer extends Model
{
    /** @use HasFactory<EngineerFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    /**
     * @var array<int, string>
     */
    public const array GENDERS = ['Male', 'Female', 'Other'];

    /**
     * @var array<int, string>
     */
    public const array MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];

    /**
     * @var array<int, string>
     */
    public const array BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    /**
     * @var array<int, string>
     */
    public const array EMPLOYEE_STATUSES = ['Active', 'Retired', 'Transferred'];

    /**
     * @var array<int, string>
     */
    public const array LANGUAGES = [
        'English',
        'Hindi',
        'Tamil',
        'Telugu',
        'Kannada',
        'Malayalam',
        'Marathi',
        'Gujarati',
        'Bengali',
        'Punjabi',
        'Odia',
        'Assamese',
        'Urdu',
        'Sanskrit',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'date_of_joining' => 'date',
            'languages_known' => 'array',
            'is_delete' => 'boolean',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<City, $this>
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * @return BelongsTo<State, $this>
     */
    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    /**
     * @return BelongsTo<EngineerType, $this>
     */
    public function engineerType(): BelongsTo
    {
        return $this->belongsTo(EngineerType::class);
    }
}
