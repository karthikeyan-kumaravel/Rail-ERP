<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The Escl. (%) field is now a plain percentage number instead of free
     * text, so it can be used directly in the Advt. Value calculation
     * (`(Qty * Unit Rate) + (Qty * Unit Rate / 100) * Escl`). Existing
     * free-text values (e.g. "At Par") aren't valid decimals, so they're
     * cleared to null before the column type changes, otherwise the ALTER
     * fails under MySQL's strict mode.
     */
    public function up(): void
    {
        DB::table('loa_items')
            ->select('id', 'escalation')
            ->whereNotNull('escalation')
            ->orderBy('id')
            ->each(function (object $item) {
                if (! is_numeric($item->escalation)) {
                    DB::table('loa_items')->where('id', $item->id)->update(['escalation' => null]);
                }
            });

        Schema::table('loa_items', function (Blueprint $table) {
            $table->decimal('escalation', 8, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loa_items', function (Blueprint $table) {
            $table->string('escalation', 100)->nullable()->change();
        });
    }
};
