<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('loa_items', function (Blueprint $table) {
            $table->string('inspection_by', 50)->nullable()->after('bid_amount');
            $table->string('payment_type', 50)->nullable()->after('inspection_by');
            $table->string('payment_percentage', 10)->nullable()->after('payment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loa_items', function (Blueprint $table) {
            $table->dropColumn(['inspection_by', 'payment_type', 'payment_percentage']);
        });
    }
};
