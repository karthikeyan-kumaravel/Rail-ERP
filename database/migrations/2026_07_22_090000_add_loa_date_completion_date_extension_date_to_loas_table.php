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
        Schema::table('loas', function (Blueprint $table) {
            $table->date('loa_date')->nullable()->after('loa_number');
            $table->date('completion_date')->nullable()->after('total_stations');
            $table->date('extension_date')->nullable()->after('completion_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loas', function (Blueprint $table) {
            $table->dropColumn(['loa_date', 'completion_date', 'extension_date']);
        });
    }
};
