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
        Schema::create('loa_financial_securities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loa_id')->constrained('loas')->cascadeOnDelete();
            $table->string('security_type', 20);
            $table->decimal('amount', 15, 2)->nullable();
            $table->string('amount_unit', 2)->default('L');
            $table->date('validity_start_date')->nullable();
            $table->date('validity_end_date')->nullable();
            $table->unsignedInteger('claim_period')->nullable();
            $table->string('claim_period_unit', 10)->default('Days');
            $table->foreignId('bank_id')->nullable()->constrained('banks')->restrictOnDelete();
            $table->string('file_path')->nullable();
            $table->string('original_file_name')->nullable();
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

            $table->unique(['loa_id', 'security_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loa_financial_securities');
    }
};
