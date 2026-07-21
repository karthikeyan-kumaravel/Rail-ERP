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
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('unique_id')->nullable()->unique()->after('id');
            $table->uuid('user_type_unique_id')->nullable()->index()->after('user_type_id');
            $table->string('acc_year')->nullable()->after('user_type_unique_id');
            $table->string('session_id')->nullable()->after('acc_year');
            $table->unsignedBigInteger('sess_user_type')->nullable()->after('session_id');
            $table->unsignedBigInteger('sess_user_id')->nullable()->after('sess_user_type');
            $table->unsignedBigInteger('sess_company_id')->nullable()->after('sess_user_id');
            $table->unsignedBigInteger('sess_branch_id')->nullable()->after('sess_company_id');
            $table->timestamp('created')->useCurrent()->after('sess_branch_id');
            $table->timestamp('updated')->useCurrent()->useCurrentOnUpdate()->after('created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'unique_id',
                'user_type_unique_id',
                'acc_year',
                'session_id',
                'sess_user_type',
                'sess_user_id',
                'sess_company_id',
                'sess_branch_id',
                'created',
                'updated',
            ]);
        });
    }
};
