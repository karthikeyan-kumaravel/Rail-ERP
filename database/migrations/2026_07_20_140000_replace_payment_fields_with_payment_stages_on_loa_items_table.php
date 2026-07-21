<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The single Payment Type + Payment Percentage pair is replaced by a
     * `payment_stages` map (e.g. {"Supply": "90%", "Commissioning": "5%"})
     * so an item can express a full multi-stage payment split instead of
     * picking just one stage.
     */
    public function up(): void
    {
        Schema::table('loa_items', function (Blueprint $table) {
            $table->json('payment_stages')->nullable()->after('inspection_by');
            $table->dropColumn(['payment_type', 'payment_percentage']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loa_items', function (Blueprint $table) {
            $table->string('payment_type', 50)->nullable()->after('inspection_by');
            $table->string('payment_percentage', 10)->nullable()->after('payment_type');
            $table->dropColumn('payment_stages');
        });
    }
};
