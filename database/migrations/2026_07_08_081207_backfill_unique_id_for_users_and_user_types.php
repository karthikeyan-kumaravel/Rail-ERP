<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach (['users', 'user_types', 'user_screens'] as $table) {
            DB::table($table)->whereNull('unique_id')->select('id')->orderBy('id')->get()->each(function (object $row) use ($table): void {
                DB::table($table)->where('id', $row->id)->update(['unique_id' => (string) Str::uuid()]);
            });
        }

        DB::table('users')
            ->whereNotNull('user_type_id')
            ->whereNull('user_type_unique_id')
            ->select('id', 'user_type_id')
            ->get()
            ->each(function (object $user): void {
                $userTypeUniqueId = DB::table('user_types')->where('id', $user->user_type_id)->value('unique_id');

                DB::table('users')->where('id', $user->id)->update(['user_type_unique_id' => $userTypeUniqueId]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
