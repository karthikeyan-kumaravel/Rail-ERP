<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The flat BG/Security Deposit fields are superseded by the granular
     * EMD/Performance BG/Security BG records in `loa_financial_securities`.
     * `mobilization_advance_*` is a separate concept (an advance payment,
     * not a guarantee) and is left untouched.
     */
    public function up(): void
    {
        Schema::table('loas', function (Blueprint $table) {
            $table->dropColumn([
                'bg_amount',
                'bg_amount_unit',
                'bg_validity',
                'security_deposit_amount',
                'security_deposit_unit',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loas', function (Blueprint $table) {
            $table->decimal('bg_amount', 15, 2)->nullable()->after('total_stations');
            $table->string('bg_amount_unit', 2)->default('L')->after('bg_amount');
            $table->date('bg_validity')->nullable()->after('bg_amount_unit');
            $table->decimal('security_deposit_amount', 15, 2)->nullable()->after('bg_validity');
            $table->string('security_deposit_unit', 2)->default('L')->after('security_deposit_amount');
        });
    }
};
