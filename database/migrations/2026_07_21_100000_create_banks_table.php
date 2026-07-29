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
        Schema::create('banks', function (Blueprint $table) {
            $table->id();

            // Bank Account Details
            $table->string('name', 100);
            $table->uuid('unique_id')->nullable()->unique();
            $table->string('branch_name', 100);
            $table->string('ifsc_code', 11);
            $table->string('account_number', 18)->unique();
            $table->string('account_holder_name', 100);
            $table->enum('account_type', ['Savings', 'Current']);
            $table->text('bank_address');
            $table->string('pincode', 6);
            $table->string('contact_number', 10);
            $table->string('email', 100)->nullable();

            // Status
            $table->boolean('active_status')->default(true);
            $table->boolean('is_delete')->default(false);

            // Common Fields

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
        Schema::dropIfExists('banks');
    }
};
