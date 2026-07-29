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
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('loa_item_id')->nullable()->constrained('loa_items')->nullOnDelete();

            $table->decimal('ordered_qty', 15, 3)->nullable();
            $table->decimal('received_qty', 15, 3)->nullable();
            $table->decimal('balance_qty', 15, 3)->nullable();

            $table->decimal('unit_price_incl_gst', 15, 2)->nullable();
            $table->decimal('unit_price_excl_gst', 15, 2)->nullable();
            $table->decimal('agreed_rate', 15, 2)->nullable();
            $table->decimal('total_price_incl_gst', 15, 2)->nullable();
            $table->decimal('total_price_excl_gst', 15, 2)->nullable();

            $table->decimal('vendor_quote_price', 15, 2)->nullable();
            $table->decimal('variance_percentage', 8, 2)->nullable();

            $table->unsignedInteger('order_no')->default(0);
            $table->timestamps();

            $table->index(['purchase_order_id', 'order_no']);
            $table->index('loa_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
    }
};
