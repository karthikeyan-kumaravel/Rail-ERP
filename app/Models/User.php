<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property string $name
 * @property string|null $username
 * @property string $email
 * @property string|null $mobile_no
 * @property int|null $user_type_id
 * @property string|null $unique_id
 * @property string|null $user_type_unique_id
 * @property string|null $acc_year
 * @property string|null $session_id
 * @property int|null $sess_user_type
 * @property int|null $sess_user_id
 * @property int|null $sess_company_id
 * @property int|null $sess_branch_id
 * @property Carbon|null $created
 * @property Carbon|null $updated
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'username', 'email', 'mobile_no', 'user_type_id', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey, Notifiable;

    protected static function booted(): void
    {
        static::saving(function (User $user): void {
            // Deliberately reads via the query builder (not ->value(), which
            // hydrates a model and would return the masked unique_id through
            // the HasMaskedRouteKey accessor) so this denormalized column
            // always stores the true, stable UserType identifier.
            $user->user_type_unique_id = $user->user_type_id
                ? DB::table('user_types')->where('id', $user->user_type_id)->value('unique_id')
                : null;
        });
    }

    /**
     * @return BelongsTo<UserType, $this>
     */
    public function userType(): BelongsTo
    {
        return $this->belongsTo(UserType::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }
}
