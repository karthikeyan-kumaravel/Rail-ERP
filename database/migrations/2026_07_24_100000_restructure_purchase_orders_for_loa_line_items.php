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
        // SQLite refuses to drop a column that a composite index still
        // references, so the `dispatch_status` index from
        // 2026_07_22_160000_add_performance_indexes_to_tables must go first.
        Schema::table('purchase_orders', function (Blueprint $table): void {
            $table->dropIndex('purchase_orders_is_delete_dispatch_status_index');
        });

        Schema::table('purchase_orders', function (Blueprint $table): void {
            $table->dropColumn([
                'supplier',
                'items_description',
                'amount',
                'payment_terms',
                'inspection_status',
                'dispatch_status',
                'total_qty',
                'received_qty',
            ]);
        });

        Schema::table('purchase_orders', function (Blueprint $table): void {
            $table->foreignId('loa_id')->nullable()->after('po_number')
                ->constrained('loas')->restrictOnDelete();
            $table->foreignId('loa_item_id')->nullable()->after('loa_id')
                ->constrained('loa_items')->nullOnDelete();
            $table->foreignId('vendor_id')->nullable()->after('loa_item_id')
                ->constrained('vendors')->nullOnDelete();

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

            $table->string('status')->default('Not Placed')->after('variance_percentage');
            $table->string('payment_type')->nullable()->after('status');

            $table->index(['is_delete', 'status'], 'purchase_orders_is_delete_status_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table): void {
            $table->dropIndex('purchase_orders_is_delete_status_index');
            $table->dropForeign(['loa_id']);
            $table->dropForeign(['loa_item_id']);
            $table->dropForeign(['vendor_id']);

            $table->dropColumn([
                'loa_id',
                'loa_item_id',
                'vendor_id',
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
                'status',
                'payment_type',
            ]);
        });

        Schema::table('purchase_orders', function (Blueprint $table): void {
            $table->string('supplier')->default('');
            $table->text('items_description')->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('payment_terms')->nullable();
            $table->string('inspection_status')->default('pending');
            $table->string('dispatch_status')->default('pending');
            $table->unsignedInteger('total_qty')->default(0);
            $table->unsignedInteger('received_qty')->default(0);

            $table->index(['is_delete', 'dispatch_status'], 'purchase_orders_is_delete_dispatch_status_index');
        });
    }
};
