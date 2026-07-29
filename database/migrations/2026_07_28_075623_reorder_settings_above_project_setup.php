<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Move the top-level Settings menu above Project Setup in the sidebar.
     */
    public function up(): void
    {
        if (! Schema::hasTable('user_screens')) {
            return;
        }

        DB::table('user_screens')
            ->where('folder_name', 'settings')
            ->whereNull('main_screen_id')
            ->update(['order_no' => 2, 'updated' => now(), 'updated_at' => now()]);
    }

    /**
     * Restore Settings to its original order relative to Project Setup.
     */
    public function down(): void
    {
        if (! Schema::hasTable('user_screens')) {
            return;
        }

        DB::table('user_screens')
            ->where('folder_name', 'settings')
            ->whereNull('main_screen_id')
            ->update(['order_no' => 3, 'updated' => now(), 'updated_at' => now()]);
    }
};
