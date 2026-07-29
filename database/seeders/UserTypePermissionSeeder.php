<?php

namespace Database\Seeders;

use App\Models\UserScreen;
use App\Models\UserType;
use App\Models\UserTypePermission;
use Illuminate\Database\Seeder;

class UserTypePermissionSeeder extends Seeder
{
    /**
     * Roles that otherwise end up with zero UserTypePermission rows, which
     * AuthorizeAdminActions treats as fully locked out of every screen.
     *
     * @var list<string>
     */
    private const OPERATIONAL_ROLES = [
        'Accounts Team',
        'Operation Team',
        'Stores Team',
        'Service Engineer',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleIds = UserType::query()
            ->whereIn('name', self::OPERATIONAL_ROLES)
            ->where('is_delete', false)
            ->pluck('id');

        $screenIds = UserScreen::query()
            ->where('is_delete', false)
            ->pluck('id');

        foreach ($roleIds as $userTypeId) {
            foreach ($screenIds as $userScreenId) {
                UserTypePermission::query()->firstOrCreate(
                    [
                        'user_type_id' => $userTypeId,
                        'user_screen_id' => $userScreenId,
                    ],
                    [
                        'can_view' => true,
                        'can_add' => true,
                        'can_update' => false,
                        'can_delete' => false,
                    ],
                );
            }
        }
    }
}
