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
        Schema::create('user_screens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('main_screen_id')->nullable()->constrained('user_screens')->nullOnDelete();
            $table->string('screen_name');
            $table->string('folder_name');
            $table->unsignedInteger('order_no')->default(0);
            $table->string('icon');
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->boolean('can_add')->default(false);
            $table->boolean('can_update')->default(false);
            $table->boolean('can_list')->default(false);
            $table->boolean('can_delete')->default(false);
            $table->boolean('can_view')->default(false);
            $table->boolean('can_cancel')->default(false);
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
        Schema::dropIfExists('user_screens');
    }
};
