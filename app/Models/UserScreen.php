<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\UserScreenFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $main_screen_id
 * @property string $screen_name
 * @property string $folder_name
 * @property int $order_no
 * @property string $icon
 * @property string|null $description
 * @property bool $status
 * @property bool $can_add
 * @property bool $can_update
 * @property bool $can_list
 * @property bool $can_delete
 * @property bool $can_view
 * @property bool $can_cancel
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
    'main_screen_id',
    'screen_name',
    'folder_name',
    'order_no',
    'icon',
    'description',
    'status',
    'can_add',
    'can_update',
    'can_list',
    'can_delete',
    'can_view',
    'can_cancel',
    'is_delete',
])]
class UserScreen extends Model
{
    /** @use HasFactory<UserScreenFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    /**
     * The icon keys selectable for a screen, rendered from the app's shared icon set.
     *
     * @var array<int, string>
     */
    public const array ICONS = [
        'home',
        'admin',
        'users',
        'user',
        'screen',
        'folder',
        'list',
        'settings',
        'key',
        'grid',
        'map',
        'building',
        'train',
        'station',
        'railway',
        'track',
        'tender',
        'bid',
        'boq',
        'bank-guarantee',
        'loa',
        'work-order',
        'project',
        'gantt-chart',
        'procurement',
        'purchase-order',
        'material-supply',
        'inspection',
        'inventory',
        'warehouse',
        'labour-management',
        'daily-progress',
        'billing',
        'bill-management',
        'payment',
        'payment-tracker',
        'finance',
        'cash-flow',
        'bank',
        'budget',
        'invoice',
        'tax',
        'engineer',
        'contractor',
        'vendor',
        'customer',
        'document',
        'reports',
        'dashboard',
        'administration',
        'notifications',
        'calendar',
        'safety',
        'quality',
        'compliance',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'can_add' => 'boolean',
            'can_update' => 'boolean',
            'can_list' => 'boolean',
            'can_delete' => 'boolean',
            'can_view' => 'boolean',
            'can_cancel' => 'boolean',
            'is_delete' => 'boolean',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<UserScreen, $this>
     */
    public function mainScreen(): BelongsTo
    {
        return $this->belongsTo(UserScreen::class, 'main_screen_id');
    }

    /**
     * @return HasMany<UserScreen, $this>
     */
    public function subScreens(): HasMany
    {
        return $this->hasMany(UserScreen::class, 'main_screen_id');
    }

    /**
     * Build the nested sidebar navigation tree from active, non-deleted screens.
     *
     * Screens are ordered by order_no ascending, with screen_name as a tiebreaker
     * so screens sharing an order_no still render in a stable, predictable order.
     *
     * @return array<int, array{screen_name: string, folder_name: string, icon: string, children: array<int, mixed>}>
     */
    public static function navigationTree(?int $parentId = null, ?Collection $screens = null): array
    {
        $screens ??= static::query()
            ->where('status', true)
            ->where('is_delete', false)
            ->orderBy('order_no')
            ->orderBy('screen_name')
            ->get(['id', 'main_screen_id', 'screen_name', 'folder_name', 'icon']);

        return $screens
            ->where('main_screen_id', $parentId)
            ->map(fn (self $screen) => [
                'screen_name' => $screen->screen_name,
                'folder_name' => $screen->folder_name,
                'icon' => $screen->icon,
                'children' => static::navigationTree($screen->id, $screens),
            ])
            ->values()
            ->all();
    }
}
