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
        Schema::create('loa_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loa_id')->constrained('loas')->cascadeOnDelete();
            $table->text('schedule_name')->nullable();
            $table->decimal('schedule_advertised_value', 18, 2)->nullable();
            $table->string('item_no', 50);
            $table->text('item_description');
            $table->string('item_code', 100)->nullable();
            $table->decimal('item_quantity', 15, 3);
            $table->string('quantity_unit', 100);
            $table->decimal('unit_rate', 18, 2);
            $table->string('escalation', 100)->nullable();
            $table->decimal('advertised_value', 18, 2);
            $table->decimal('bid_rate', 18, 2);
            $table->string('bid_rate_unit', 50)->nullable();
            $table->decimal('bid_amount', 18, 2);
            $table->unsignedInteger('order_no')->default(0);
            $table->timestamps();

            $table->index(['loa_id', 'order_no']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loa_items');
    }
};
