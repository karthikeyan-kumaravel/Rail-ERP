<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `UserScreen::navigationTree()` only renders screens where `status` is
     * true, so a screen with `status = false` disappears from the sidebar
     * for every role — including Super Admin — even though its
     * `user_type_permissions` rows still grant `can_add`. The "Project
     * Creation" (`projects`) and "Purchase Orders" (`purchase-orders`)
     * screens ended up with `status = false` while every sibling screen in
     * their respective menu groups stayed active, hiding both modules'
     * Add pages from navigation for all users. Re-enable only those two,
     * matched by folder name and parent group so this is a no-op anywhere
     * the data is already correct (fresh installs included).
     */
    public function up(): void
    {
        if (! Schema::hasTable('user_screens')) {
            return;
        }

        $settings = DB::table('user_screens')
            ->where('folder_name', 'settings')
            ->whereNull('main_screen_id')
            ->first(['id']);

        if ($settings !== null) {
            DB::table('user_screens')
                ->where('folder_name', 'projects')
                ->where('main_screen_id', $settings->id)
                ->where('is_delete', false)
                ->where('status', false)
                ->update(['status' => true, 'updated' => now(), 'updated_at' => now()]);
        }

        $projectSetup = DB::table('user_screens')
            ->where('folder_name', 'project-setup')
            ->whereNull('main_screen_id')
            ->first(['id']);

        if ($projectSetup !== null) {
            DB::table('user_screens')
                ->where('folder_name', 'purchase-orders')
                ->where('main_screen_id', $projectSetup->id)
                ->where('is_delete', false)
                ->where('status', false)
                ->update(['status' => true, 'updated' => now(), 'updated_at' => now()]);
        }
    }

    /**
     * Data-correction migration; nothing to structurally reverse.
     */
    public function down(): void
    {
        //
    }
};
