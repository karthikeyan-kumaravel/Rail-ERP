<?php

namespace App\Models;

use Database\Factories\BankFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string|null $unique_id
 * @property string $branch_name
 * @property string $ifsc_code
 * @property string $account_number
 * @property string $account_holder_name
 * @property string $account_type
 * @property string $bank_address
 * @property string $pincode
 * @property string $contact_number
 * @property string|null $email
 * @property bool $active_status
 * @property bool $is_delete
 * @property string|null $acc_year
 * @property int|null $sess_user_type
 * @property int|null $sess_user_id
 * @property int|null $sess_company_id
 * @property int|null $sess_branch_id
 * @property Carbon|null $created
 * @property Carbon|null $updated
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Bank extends Model
{
    /** @use HasFactory<BankFactory> */
    use HasFactory;

    protected $table = 'banks';

    protected $fillable = [
        'unique_id',
        'name',
        'branch_name',
        'ifsc_code',
        'account_number',
        'account_holder_name',
        'account_type',
        'bank_address',
        'pincode',
        'contact_number',
        'email',
        'active_status',
        'is_delete',
        'unique_id',
        'acc_year',
        'sess_user_type',
        'sess_user_id',
        'sess_company_id',
        'sess_branch_id',
    ];

    protected function casts(): array
    {
        return [
            'active_status' => 'boolean',
            'is_delete' => 'boolean',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Bank $bank) {
            if (empty($bank->unique_id)) {
                $bank->unique_id = (string) Str::uuid();
            }

            $bank->acc_year ??= static::currentAccYear();
            $bank->created = Carbon::now();
            $bank->updated = Carbon::now();
            $bank->sess_user_id = auth()->id();
            $bank->sess_user_type = auth()->user()?->user_type_id;
        });

        static::updating(function (Bank $bank) {
            $bank->updated = Carbon::now();
            $bank->sess_user_id = auth()->id();
            $bank->sess_user_type = auth()->user()?->user_type_id;
        });
    }

    protected static function currentAccYear(): string
    {
        $now = Carbon::now();
        $startYear = $now->month >= 4 ? $now->year : $now->year - 1;

        return "{$startYear}-".($startYear + 1);
    }

    public function getRouteKeyName()
    {
        return 'unique_id';
    }

    /**
     * @return HasMany<LoaFinancialSecurity, $this>
     */
    public function financialSecurities(): HasMany
    {
        return $this->hasMany(LoaFinancialSecurity::class);
    }
}
