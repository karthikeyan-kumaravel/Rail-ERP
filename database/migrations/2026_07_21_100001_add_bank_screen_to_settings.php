<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const INSERTED_SCREEN_UNIQUE_ID = '2a2f0a9e-1c8b-4a2e-9a1b-2f6b7e8c9d10';

    /**
     * Add Bank under the existing Settings menu.
     */
    public function up(): void
    {
        if (! Schema::hasTable('user_screens')) {
            return;
        }

        $settings = DB::table('user_screens')
            ->where('folder_name', 'settings')
            ->whereNull('main_screen_id')
            ->orderBy('id')
            ->first();

        if ($settings === null) {
            return;
        }

        $attributes = [
            'main_screen_id' => $settings->id,
            'screen_name' => 'Bank',
            'order_no' => 9,
            'icon' => 'bank',
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
            ->where('folder_name', 'banks')
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
            'folder_name' => 'banks',
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
            ->where('folder_name', 'banks')
            ->where('unique_id', self::INSERTED_SCREEN_UNIQUE_ID)
            ->delete();
    }
};
