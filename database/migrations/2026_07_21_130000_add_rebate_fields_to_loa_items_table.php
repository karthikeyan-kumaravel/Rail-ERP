<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('loa_items', function (Blueprint $table) {
            $table->boolean('rebate_enabled')->default(false)->after('bid_amount');
            $table->decimal('rebate_percentage', 5, 2)->default(0)->after('rebate_enabled');
            $table->decimal('rebate_amount', 18, 2)->default(0)->after('rebate_percentage');
            $table->decimal('final_bid_amount', 18, 2)->default(0)->after('rebate_amount');
        });

        // Existing rows predate this feature (no rebate applied), so their
        // Final Bid Amount is simply the Bid Amount already on record — the
        // column's own default of 0 only covers newly inserted rows.
        DB::table('loa_items')->update(['final_bid_amount' => DB::raw('bid_amount')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loa_items', function (Blueprint $table) {
            $table->dropColumn(['rebate_enabled', 'rebate_percentage', 'rebate_amount', 'final_bid_amount']);
        });
    }
};
