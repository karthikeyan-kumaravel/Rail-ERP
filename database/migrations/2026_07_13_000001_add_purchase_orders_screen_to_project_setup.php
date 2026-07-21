<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const INSERTED_PROJECT_SETUP_UNIQUE_ID = 'a5e42188-4287-4e64-a60b-6fa5bb3a5242';

    private const INSERTED_SCREEN_UNIQUE_ID = '8c478e4a-01f2-4e61-8c21-cb88331a7213';

    /**
     * Add or re-enable Purchase Orders under an existing Project Setup menu.
     */
    public function up(): void
    {
        if (! Schema::hasTable('user_screens')) {
            return;
        }

        $projectSetup = DB::table('user_screens')
            ->where('folder_name', 'project-setup')
            ->whereNull('main_screen_id')
            ->orderBy('id')
            ->first();

        if ($projectSetup === null) {
            $projectSetupId = (int) DB::table('user_screens')->insertGetId([
                'main_screen_id' => null,
                'screen_name' => 'Project Setup',
                'folder_name' => 'project-setup',
                'order_no' => 5,
                'icon' => 'folder',
                'description' => 'Project setup and LOA (contract award) management.',
                'status' => true,
                'can_add' => true,
                'can_update' => true,
                'can_list' => true,
                'can_delete' => true,
                'can_view' => true,
                'can_cancel' => true,
                'is_delete' => false,
                'unique_id' => self::INSERTED_PROJECT_SETUP_UNIQUE_ID,
                'created' => now(),
                'updated' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $projectSetupId = (int) $projectSetup->id;

            DB::table('user_screens')
                ->where('id', $projectSetupId)
                ->update([
                    'status' => true,
                    'is_delete' => false,
                    'updated' => now(),
                    'updated_at' => now(),
                ]);
        }

        $attributes = [
            'main_screen_id' => $projectSetupId,
            'screen_name' => 'Purchase Orders',
            'order_no' => 2,
            'icon' => 'list',
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
            ->where('folder_name', 'purchase-orders')
            ->where('main_screen_id', $projectSetupId)
            ->orderBy('id')
            ->first();

        $existingScreen ??= DB::table('user_screens')
            ->where('folder_name', 'purchase-orders')
            ->whereNull('main_screen_id')
            ->orderBy('id')
            ->first();

        $existingScreen ??= DB::table('user_screens')
            ->where('folder_name', 'purchase-orders')
            ->orderBy('id')
            ->first();

        if ($existingScreen !== null) {
            DB::table('user_screens')
                ->where('id', $existingScreen->id)
                ->update($attributes);

            return;
        }

        DB::table('user_screens')->insert([
            ...$attributes,
            'folder_name' => 'purchase-orders',
            'description' => 'Purchase order delivery and inspection tracking.',
            'unique_id' => self::INSERTED_SCREEN_UNIQUE_ID,
            'created' => now(),
            'created_at' => now(),
        ]);
    }

    /**
     * Remove only the screen inserted by this migration.
     */
    public function down(): void
    {
        if (! Schema::hasTable('user_screens')) {
            return;
        }

        DB::table('user_screens')
            ->where('folder_name', 'purchase-orders')
            ->where('unique_id', self::INSERTED_SCREEN_UNIQUE_ID)
            ->delete();

        DB::table('user_screens')
            ->where('folder_name', 'project-setup')
            ->where('unique_id', self::INSERTED_PROJECT_SETUP_UNIQUE_ID)
            ->delete();
    }
};
