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
            $table->foreignId('schedule_name_id')->nullable()->after('loa_id')->constrained('schedule_names')->nullOnDelete();
            $table->foreignId('schedule_type_id')->nullable()->after('schedule_name_id')->constrained('schedule_types')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loa_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('schedule_name_id');
            $table->dropConstrainedForeignId('schedule_type_id');
        });
    }
};
