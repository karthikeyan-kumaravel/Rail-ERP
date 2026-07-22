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
        Schema::table('loa_team_members', function (Blueprint $table) {
            $table->foreignId('engineer_id')->nullable()->after('loa_id')->constrained('engineers')->nullOnDelete();
            $table->foreignId('engineer_type_id')->nullable()->after('engineer_id')->constrained('engineer_types')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loa_team_members', function (Blueprint $table) {
            $table->dropConstrainedForeignId('engineer_id');
            $table->dropConstrainedForeignId('engineer_type_id');
        });
    }
};
