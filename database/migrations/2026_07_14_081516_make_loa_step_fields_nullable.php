<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Lets the LOA create/edit form save progress tab by tab
     * ("Save & Continue") before every field has been filled in, by
     * dropping the NOT NULL constraint on every field that isn't entered on
     * the very first tab.
     */
    public function up(): void
    {
        Schema::table('loas', function (Blueprint $table) {
            $table->dropForeign(['division_id']);
        });

        Schema::table('loas', function (Blueprint $table) {
            $table->string('loa_number')->nullable()->change();
            $table->string('client')->nullable()->change();
            $table->unsignedBigInteger('division_id')->nullable()->change();
            $table->string('work_type')->nullable()->change();
            $table->decimal('contract_value_amount', 15, 2)->nullable()->change();
            $table->unsignedInteger('completion_period_months')->nullable()->change();
            $table->unsignedInteger('defect_liability_months')->nullable()->change();
            $table->date('start_date')->nullable()->change();
            $table->date('end_date')->nullable()->change();
            $table->unsignedInteger('total_stations')->nullable()->change();
            $table->decimal('bg_amount', 15, 2)->nullable()->change();
            $table->date('bg_validity')->nullable()->change();
            $table->decimal('security_deposit_amount', 15, 2)->nullable()->change();
            $table->decimal('mobilization_advance_amount', 15, 2)->nullable()->change();
            $table->text('scope_of_work')->nullable()->change();
        });

        Schema::table('loas', function (Blueprint $table) {
            $table->foreign('division_id')->references('id')->on('divisions')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loas', function (Blueprint $table) {
            $table->dropForeign(['division_id']);
        });

        Schema::table('loas', function (Blueprint $table) {
            $table->string('loa_number')->nullable(false)->change();
            $table->string('client')->nullable(false)->change();
            $table->unsignedBigInteger('division_id')->nullable(false)->change();
            $table->string('work_type')->nullable(false)->change();
            $table->decimal('contract_value_amount', 15, 2)->nullable(false)->change();
            $table->unsignedInteger('completion_period_months')->nullable(false)->change();
            $table->unsignedInteger('defect_liability_months')->nullable(false)->change();
            $table->date('start_date')->nullable(false)->change();
            $table->date('end_date')->nullable(false)->change();
            $table->unsignedInteger('total_stations')->nullable(false)->change();
            $table->decimal('bg_amount', 15, 2)->nullable(false)->change();
            $table->date('bg_validity')->nullable(false)->change();
            $table->decimal('security_deposit_amount', 15, 2)->nullable(false)->change();
            $table->decimal('mobilization_advance_amount', 15, 2)->nullable(false)->change();
            $table->text('scope_of_work')->nullable(false)->change();
        });

        Schema::table('loas', function (Blueprint $table) {
            $table->foreign('division_id')->references('id')->on('divisions')->restrictOnDelete();
        });
    }
};
