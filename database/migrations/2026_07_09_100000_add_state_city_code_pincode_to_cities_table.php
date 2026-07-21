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
        Schema::table('cities', function (Blueprint $table) {
            $table->foreignId('state_id')->after('district_id')->constrained('states')->restrictOnDelete();
            $table->string('city_code', 10)->nullable()->after('name');
            $table->string('pincode', 10)->after('city_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('state_id');
            $table->dropColumn(['city_code', 'pincode']);
        });
    }
};
