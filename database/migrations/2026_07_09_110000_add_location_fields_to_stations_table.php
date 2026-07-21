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
        Schema::table('stations', function (Blueprint $table) {
            $table->foreignId('state_id')->after('division_id')->constrained('states')->restrictOnDelete();
            $table->foreignId('district_id')->after('state_id')->constrained('districts')->restrictOnDelete();
            $table->foreignId('city_id')->after('district_id')->constrained('cities')->restrictOnDelete();
            $table->text('address')->after('station_name');
            $table->decimal('latitude', 10, 7)->nullable()->after('address');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('state_id');
            $table->dropConstrainedForeignId('district_id');
            $table->dropConstrainedForeignId('city_id');
            $table->dropColumn(['address', 'latitude', 'longitude']);
        });
    }
};
