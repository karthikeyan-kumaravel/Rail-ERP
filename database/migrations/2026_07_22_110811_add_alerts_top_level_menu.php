<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const INSERTED_UNIQUE_ID = '7c9e3a4f-2b6d-4e1a-9f3c-1d8a6b5e0c7a';

    /**
     * Add a top-level "Alerts & Reminders" sidebar entry with no children.
     */
    public function up(): void
    {
        if (! Schema::hasTable('user_screens')) {
            return;
        }

        $attributes = [
            'main_screen_id' => null,
            'screen_name' => 'Alerts & Reminders',
            'order_no' => 13,
            'icon' => 'notifications',
            'description' => 'System-generated alerts and reminders.',
            'status' => true,
            'can_add' => false,
            'can_update' => false,
            'can_list' => true,
            'can_delete' => false,
            'can_view' => true,
            'can_cancel' => false,
            'is_delete' => false,
            'updated' => now(),
            'updated_at' => now(),
        ];

        $existing = DB::table('user_screens')
            ->where('folder_name', 'alerts')
            ->whereNull('main_screen_id')
            ->orderBy('id')
            ->first();

        if ($existing !== null) {
            DB::table('user_screens')->where('id', $existing->id)->update($attributes);

            return;
        }

        DB::table('user_screens')->insert([
            ...$attributes,
            'folder_name' => 'alerts',
            'unique_id' => self::INSERTED_UNIQUE_ID,
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

        DB::table('user_screens')->where('unique_id', self::INSERTED_UNIQUE_ID)->delete();
    }
};
