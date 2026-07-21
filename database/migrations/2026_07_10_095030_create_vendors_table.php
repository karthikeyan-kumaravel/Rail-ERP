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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('name');
            $table->string('contact_no', 20);
            $table->string('alternate_contact_no', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('gst_no', 20)->nullable();
            $table->string('pan_no', 10);
            $table->string('pan_proof_path');
            $table->string('pincode', 10);
            $table->foreignId('state_id')->nullable()->constrained('states')->nullOnDelete();
            $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
            $table->string('zone_name')->nullable();
            $table->string('bank_name');
            $table->string('branch_name')->nullable();
            $table->string('account_no', 30);
            $table->string('ifsc_code', 15);
            $table->string('account_holder_name');
            $table->string('bank_proof_path');
            $table->text('address');
            $table->string('username')->nullable()->unique();
            $table->string('password')->nullable();
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
        Schema::dropIfExists('vendors');
    }
};
