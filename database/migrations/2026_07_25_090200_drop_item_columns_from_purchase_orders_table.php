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
        Schema::table('purchase_orders', function (Blueprint $table): void {
            $table->dropForeign(['loa_item_id']);

            $table->dropColumn([
                'loa_item_id',
                'ordered_qty',
                'received_qty',
                'balance_qty',
                'unit_price_incl_gst',
                'unit_price_excl_gst',
                'agreed_rate',
                'total_price_incl_gst',
                'total_price_excl_gst',
                'vendor_quote_price',
                'variance_percentage',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table): void {
            $table->foreignId('loa_item_id')->nullable()->after('loa_id')
                ->constrained('loa_items')->nullOnDelete();

            $table->decimal('ordered_qty', 15, 3)->nullable()->after('vendor_id');
            $table->decimal('received_qty', 15, 3)->nullable()->after('ordered_qty');
            $table->decimal('balance_qty', 15, 3)->nullable()->after('received_qty');

            $table->decimal('unit_price_incl_gst', 15, 2)->nullable()->after('balance_qty');
            $table->decimal('unit_price_excl_gst', 15, 2)->nullable()->after('unit_price_incl_gst');
            $table->decimal('agreed_rate', 15, 2)->nullable()->after('unit_price_excl_gst');
            $table->decimal('total_price_incl_gst', 15, 2)->nullable()->after('agreed_rate');
            $table->decimal('total_price_excl_gst', 15, 2)->nullable()->after('total_price_incl_gst');

            $table->decimal('vendor_quote_price', 15, 2)->nullable()->after('total_price_excl_gst');
            $table->decimal('variance_percentage', 8, 2)->nullable()->after('vendor_quote_price');
        });
    }
};
