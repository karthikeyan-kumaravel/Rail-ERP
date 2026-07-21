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
        Schema::create('loas', function (Blueprint $table) {
            $table->id();

            // LOA Details
            $table->string('loa_number');
            $table->string('client');
            $table->foreignId('division_id')->constrained('divisions')->restrictOnDelete();
            $table->string('work_type');
            $table->decimal('contract_value_amount', 15, 2);
            $table->string('contract_value_unit', 2)->default('Cr');
            $table->unsignedInteger('completion_period_months');
            $table->unsignedInteger('defect_liability_months');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('total_stations');

            // Financial Security
            $table->decimal('bg_amount', 15, 2);
            $table->string('bg_amount_unit', 2)->default('L');
            $table->date('bg_validity');
            $table->decimal('security_deposit_amount', 15, 2);
            $table->string('security_deposit_unit', 2)->default('L');
            $table->decimal('mobilization_advance_amount', 15, 2);
            $table->string('mobilization_advance_unit', 2)->default('L');
            $table->string('mobilization_advance_status')->default('Pending');

            // Scope of Work
            $table->text('scope_of_work');

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
        Schema::dropIfExists('loas');
    }
};
