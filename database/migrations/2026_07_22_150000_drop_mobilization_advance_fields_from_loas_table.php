<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The Mobilization Advance feature has been removed from the LOA
     * workflow — these columns are no longer read, written, or validated
     * anywhere in the application.
     */
    public function up(): void
    {
        Schema::table('loas', function (Blueprint $table) {
            $table->dropColumn([
                'mobilization_advance_amount',
                'mobilization_advance_unit',
                'mobilization_advance_status',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loas', function (Blueprint $table) {
            $table->decimal('mobilization_advance_amount', 15, 2)->nullable()->after('total_stations');
            $table->string('mobilization_advance_unit', 2)->default('L')->after('mobilization_advance_amount');
            $table->string('mobilization_advance_status')->default('Pending')->after('mobilization_advance_unit');
        });
    }
};
