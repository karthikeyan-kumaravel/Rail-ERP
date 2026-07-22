<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\UserTypePermissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_type_id
 * @property int $user_screen_id
 * @property bool $can_view
 * @property bool $can_add
 * @property bool $can_update
 * @property bool $can_delete
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
    'user_type_id',
    'user_screen_id',
    'can_view',
    'can_add',
    'can_update',
    'can_delete',
    'is_delete',
])]
class UserTypePermission extends Model
{
    /** @use HasFactory<UserTypePermissionFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'can_view' => 'boolean',
            'can_add' => 'boolean',
            'can_update' => 'boolean',
            'can_delete' => 'boolean',
            'is_delete' => 'boolean',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<UserType, $this>
     */
    public function userType(): BelongsTo
    {
        return $this->belongsTo(UserType::class);
    }

    /**
     * @return BelongsTo<UserScreen, $this>
     */
    public function userScreen(): BelongsTo
    {
        return $this->belongsTo(UserScreen::class);
    }
}
