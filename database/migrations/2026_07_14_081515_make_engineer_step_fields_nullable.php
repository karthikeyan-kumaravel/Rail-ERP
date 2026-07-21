<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Lets the Engineer Master create/edit form save progress tab by tab
     * ("Save & Continue") before every field has been filled in, by
     * dropping the NOT NULL constraint on every field that isn't entered on
     * the very first tab.
     */
    public function up(): void
    {
        Schema::table('engineers', function (Blueprint $table) {
            $table->dropForeign(['engineer_type_id']);
        });

        Schema::table('engineers', function (Blueprint $table) {
            $table->string('full_name')->nullable()->change();
            $table->string('gender')->nullable()->change();
            $table->date('date_of_birth')->nullable()->change();
            $table->string('mobile_number', 15)->nullable()->change();
            $table->string('official_email')->nullable()->change();
            $table->text('current_address')->nullable()->change();
            $table->text('permanent_address')->nullable()->change();
            $table->string('postal_code', 10)->nullable()->change();
            $table->string('aadhaar_number', 12)->nullable()->change();
            $table->string('pan_number', 10)->nullable()->change();
            $table->date('date_of_joining')->nullable()->change();
            $table->unsignedBigInteger('engineer_type_id')->nullable()->change();
        });

        Schema::table('engineers', function (Blueprint $table) {
            $table->foreign('engineer_type_id')->references('id')->on('engineer_types')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('engineers', function (Blueprint $table) {
            $table->dropForeign(['engineer_type_id']);
        });

        Schema::table('engineers', function (Blueprint $table) {
            $table->string('full_name')->nullable(false)->change();
            $table->string('gender')->nullable(false)->change();
            $table->date('date_of_birth')->nullable(false)->change();
            $table->string('mobile_number', 15)->nullable(false)->change();
            $table->string('official_email')->nullable(false)->change();
            $table->text('current_address')->nullable(false)->change();
            $table->text('permanent_address')->nullable(false)->change();
            $table->string('postal_code', 10)->nullable(false)->change();
            $table->string('aadhaar_number', 12)->nullable(false)->change();
            $table->string('pan_number', 10)->nullable(false)->change();
            $table->date('date_of_joining')->nullable(false)->change();
            $table->unsignedBigInteger('engineer_type_id')->nullable(false)->change();
        });

        Schema::table('engineers', function (Blueprint $table) {
            $table->foreign('engineer_type_id')->references('id')->on('engineer_types')->restrictOnDelete();
        });
    }
};
