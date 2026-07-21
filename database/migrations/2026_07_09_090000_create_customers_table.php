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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('billing_address');
            $table->string('pin_code', 10);
            $table->foreignId('state_id')->constrained('states')->restrictOnDelete();
            $table->foreignId('district_id')->constrained('districts')->restrictOnDelete();
            $table->string('zone');
            $table->string('contact_name');
            $table->string('contact_number', 20);
            $table->string('contact_landline_number', 20)->nullable();
            $table->string('email')->nullable();
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
        Schema::dropIfExists('customers');
    }
};
