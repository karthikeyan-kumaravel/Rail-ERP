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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('zone_id')->constrained('zones')->restrictOnDelete();
            $table->foreignId('division_id')->constrained('divisions')->restrictOnDelete();
            $table->foreignId('loa_id')->constrained('loas')->restrictOnDelete();
            $table->decimal('contract_value', 15, 2);
            $table->boolean('active_status')->default(true);
            $table->boolean('is_delete')->default(false);

            $table->uuid('unique_id')->nullable()->unique();
            $table->string('acc_year')->nullable();
            $table->string('session_id')->nullable();
            $table->unsignedBigInteger('sess_user_type')->nullable();
            $table->unsignedBigInteger('sess_user_id')->nullable();
            $table->unsignedBigInteger('sess_company_id')->nullable();
            $table->unsignedBigInteger('sess_branch_id')->nullable();
            $table->timestamp('created')->useCurrent();
            $table->timestamp('updated')->useCurrent()->useCurrentOnUpdate();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
