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
            $table->string('item_category')->nullable()->after('item_description');
            $table->string('specialization_file_path')->nullable()->after('item_category');
            $table->string('specialization_original_file_name')->nullable()->after('specialization_file_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loa_items', function (Blueprint $table) {
            $table->dropColumn(['item_category', 'specialization_file_path', 'specialization_original_file_name']);
        });
    }
};
