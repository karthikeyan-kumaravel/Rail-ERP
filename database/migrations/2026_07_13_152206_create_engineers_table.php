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
        Schema::create('engineers', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code')->unique();
            $table->string('full_name');
            $table->string('gender');
            $table->date('date_of_birth');
            $table->string('blood_group')->nullable();
            $table->string('nationality')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('mobile_number', 15)->unique();
            $table->string('alternate_mobile_number', 15)->nullable();
            $table->string('official_email')->unique();
            $table->string('personal_email')->nullable();
            $table->text('current_address');
            $table->text('permanent_address');
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete();
            $table->foreignId('state_id')->nullable()->constrained('states')->nullOnDelete();
            $table->string('postal_code', 10);
            $table->string('aadhaar_number', 12)->unique();
            $table->string('pan_number', 10)->unique();
            $table->date('date_of_joining');
            $table->string('employee_status')->default('active');
            $table->foreignId('engineer_type_id')->constrained('engineer_types')->restrictOnDelete();
            $table->string('bank_name')->nullable();
            $table->string('branch_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('ifsc_code', 15)->nullable();
            $table->string('pf_account_number')->nullable();
            $table->string('esi_account_number')->nullable();
            $table->json('languages_known')->nullable();
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
        Schema::dropIfExists('engineers');
    }
};
