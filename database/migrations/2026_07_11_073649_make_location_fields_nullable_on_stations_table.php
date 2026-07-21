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
            $table->foreignId('state_id')->nullable()->change();
            $table->foreignId('district_id')->nullable()->change();
            $table->foreignId('city_id')->nullable()->change();
            $table->text('address')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stations', function (Blueprint $table) {
            $table->foreignId('state_id')->nullable(false)->change();
            $table->foreignId('district_id')->nullable(false)->change();
            $table->foreignId('city_id')->nullable(false)->change();
            $table->text('address')->nullable(false)->change();
        });
    }
};
