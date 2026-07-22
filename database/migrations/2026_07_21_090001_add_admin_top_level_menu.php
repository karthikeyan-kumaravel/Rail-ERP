<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const INSERTED_ADMIN_UNIQUE_ID = 'ae47bd83-2714-4819-aa7b-9b2777931eb1';

    /**
     * @var array<string, string>
     */
    private const INSERTED_SCREEN_UNIQUE_IDS = [
        'users' => '34c07398-4b89-4fde-bf8e-8fe858ae4e43',
        'user-types' => 'c210eaa0-34bf-4963-be4f-1c606c9a230e',
        'user-screens' => '3d8675c1-d5bd-482f-ac57-5e43fa3ad1b1',
        'user-type-permissions' => 'f5790823-5616-4326-8e15-c88661f14e9b',
    ];

    /**
     * Add an "Admin" top-level menu grouping Users, User Types, User Screens,
     * and User Type Permission, none of which had a sidebar entry before.
     */
    public function up(): void
    {
        if (! Schema::hasTable('user_screens')) {
            return;
        }

        $admin = DB::table('user_screens')
            ->where('folder_name', 'admin')
            ->whereNull('main_screen_id')
            ->orderBy('id')
            ->first();

        if ($admin === null) {
            $adminId = (int) DB::table('user_screens')->insertGetId([
                'main_screen_id' => null,
                'screen_name' => 'Admin',
                'folder_name' => 'admin',
                'order_no' => 1,
                'icon' => 'admin',
                'description' => 'User, role, and permission administration.',
                'status' => true,
                'can_add' => true,
                'can_update' => true,
                'can_list' => true,
                'can_delete' => true,
                'can_view' => true,
                'can_cancel' => true,
                'is_delete' => false,
                'unique_id' => self::INSERTED_ADMIN_UNIQUE_ID,
                'created' => now(),
                'updated' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $adminId = (int) $admin->id;

            DB::table('user_screens')
                ->where('id', $adminId)
                ->update([
                    'status' => true,
                    'is_delete' => false,
                    'updated' => now(),
                    'updated_at' => now(),
                ]);
        }

        $children = [
            ['folder_name' => 'users', 'screen_name' => 'Users', 'order_no' => 1, 'icon' => 'users'],
            ['folder_name' => 'user-types', 'screen_name' => 'User Types', 'order_no' => 2, 'icon' => 'user'],
            ['folder_name' => 'user-screens', 'screen_name' => 'User Screens', 'order_no' => 3, 'icon' => 'screen'],
            ['folder_name' => 'user-type-permissions', 'screen_name' => 'User Type Permission', 'order_no' => 4, 'icon' => 'key'],
        ];

        foreach ($children as $child) {
            $attributes = [
                'main_screen_id' => $adminId,
                'screen_name' => $child['screen_name'],
                'order_no' => $child['order_no'],
                'icon' => $child['icon'],
                'status' => true,
                'can_add' => true,
                'can_update' => true,
                'can_list' => true,
                'can_delete' => true,
                'can_view' => true,
                'can_cancel' => true,
                'is_delete' => false,
                'updated' => now(),
                'updated_at' => now(),
            ];

            $existingScreen = DB::table('user_screens')
                ->where('folder_name', $child['folder_name'])
                ->where('main_screen_id', $adminId)
                ->orderBy('id')
                ->first();

            $existingScreen ??= DB::table('user_screens')
                ->where('folder_name', $child['folder_name'])
                ->orderBy('id')
                ->first();

            if ($existingScreen !== null) {
                DB::table('user_screens')
                    ->where('id', $existingScreen->id)
                    ->update($attributes);

                continue;
            }

            DB::table('user_screens')->insert([
                ...$attributes,
                'folder_name' => $child['folder_name'],
                'unique_id' => self::INSERTED_SCREEN_UNIQUE_IDS[$child['folder_name']],
                'created' => now(),
                'created_at' => now(),
            ]);
        }
    }

    /**
     * Remove only the screens inserted by this migration.
     */
    public function down(): void
    {
        if (! Schema::hasTable('user_screens')) {
            return;
        }

        foreach (self::INSERTED_SCREEN_UNIQUE_IDS as $uniqueId) {
            DB::table('user_screens')->where('unique_id', $uniqueId)->delete();
        }

        DB::table('user_screens')->where('unique_id', self::INSERTED_ADMIN_UNIQUE_ID)->delete();
    }
};
