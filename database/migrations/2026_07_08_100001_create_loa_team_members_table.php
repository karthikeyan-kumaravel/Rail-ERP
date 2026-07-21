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
        Schema::create('loa_team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loa_id')->constrained('loas')->cascadeOnDelete();
            $table->string('name');
            $table->string('role');
            $table->unsignedInteger('order_no')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loa_team_members');
    }
};
