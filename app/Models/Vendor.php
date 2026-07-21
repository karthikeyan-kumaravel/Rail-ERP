<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\VendorFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $company_name
 * @property string $name
 * @property string $contact_no
 * @property string|null $alternate_contact_no
 * @property string|null $email
 * @property string|null $gst_no
 * @property string $pan_no
 * @property string|null $pan_proof_path
 * @property string $pincode
 * @property int|null $state_id
 * @property int|null $district_id
 * @property string|null $zone_name
 * @property string $bank_name
 * @property string|null $branch_name
 * @property string $account_no
 * @property string $ifsc_code
 * @property string $account_holder_name
 * @property string|null $bank_proof_path
 * @property string $address
 * @property string|null $username
 * @property string|null $password
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
 * @property-read State|null $state
 * @property-read District|null $district
 */
#[Fillable([
    'company_name',
    'name',
    'contact_no',
    'alternate_contact_no',
    'email',
    'gst_no',
    'pan_no',
    'pan_proof_path',
    'pincode',
    'state_id',
    'district_id',
    'zone_name',
    'bank_name',
    'branch_name',
    'account_no',
    'ifsc_code',
    'account_holder_name',
    'bank_proof_path',
    'address',
    'username',
    'password',
    'active_status',
    'is_delete',
])]
#[Hidden(['password'])]
class Vendor extends Model
{
    /** @use HasFactory<VendorFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'active_status' => 'boolean',
            'is_delete' => 'boolean',
            'password' => 'hashed',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<State, $this>
     */
    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    /**
     * @return BelongsTo<District, $this>
     */
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }
}
