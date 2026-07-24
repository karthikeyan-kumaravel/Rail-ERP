<?php

use App\Models\LoaItem;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\UserScreen;
use App\Models\Vendor;
use App\Support\MaskedIdentifier;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

/**
 * @return array<string, mixed>
 */
function validPurchaseOrderItemPayload(array $overrides = []): array
{
    $loaItem = LoaItem::factory()->create();
    $vendor = Vendor::factory()->create();

    return array_merge([
        'po_number' => 'PO/2026/005',
        'order_date' => '2026-07-01',
        'loa_id' => $loaItem->loa_id,
        'loa_item_id' => $loaItem->id,
        'vendor_id' => $vendor->id,
        'ordered_qty' => 100,
        'received_qty' => 40,
        'unit_price_incl_gst' => 118,
        'unit_price_excl_gst' => 100,
        'agreed_rate' => 100,
        'total_price_incl_gst' => 11800,
        'total_price_excl_gst' => 10000,
        'vendor_quote_price' => 110,
        'delivery_date' => '2026-08-15',
        'status' => 'Placed',
        'payment_type' => 'Advance',
    ], $overrides);
}

test('the create page renders as a standalone route with lookup options', function () {
    $loaItem = LoaItem::factory()->create();
    Vendor::factory()->create();

    $this->get('/admin/purchase-orders/create')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/purchase-orders/create')
            ->has('loas')
            ->has('loa_items')
            ->has('vendors')
            ->has('status_options', 4)
            ->has('payment_type_options', 4)
            ->where('loa_items.0.loa_id', $loaItem->loa_id));
});

test('the edit page renders with the purchase order using its masked route key', function () {
    $purchaseOrder = PurchaseOrder::factory()->create(['po_number' => 'PO/2026/006']);

    $this->get("/admin/purchase-orders/{$purchaseOrder->unique_id}/edit")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/purchase-orders/edit')
            ->where('purchaseOrder.po_number', 'PO/2026/006')
            ->where('purchaseOrder.unique_id', fn (string $value): bool => MaskedIdentifier::decode($value) === $purchaseOrder->getRawOriginal('unique_id')));
});

test('a purchase order item can be created with balance qty and variance auto-calculated', function () {
    $response = $this->post('/admin/purchase-orders', [
        'items' => [validPurchaseOrderItemPayload()],
    ]);

    $response->assertRedirect('/admin/purchase-orders');
    $response->assertSessionDoesntHaveErrors();

    $purchaseOrder = PurchaseOrder::query()->where('po_number', 'PO/2026/005')->firstOrFail();

    expect((float) $purchaseOrder->ordered_qty)->toBe(100.0)
        ->and((float) $purchaseOrder->received_qty)->toBe(40.0)
        ->and((float) $purchaseOrder->balance_qty)->toBe(60.0)
        ->and((float) $purchaseOrder->variance_percentage)->toBe(10.0)
        ->and($purchaseOrder->unique_id)->not->toBeNull();
});

test('multiple items in one request are saved as separate rows sharing the same po number', function () {
    $response = $this->post('/admin/purchase-orders', [
        'items' => [
            validPurchaseOrderItemPayload(['po_number' => 'PO/2026/010']),
            validPurchaseOrderItemPayload(['po_number' => 'PO/2026/010']),
        ],
    ]);

    $response->assertRedirect('/admin/purchase-orders');
    $response->assertSessionDoesntHaveErrors();

    expect(PurchaseOrder::query()->where('po_number', 'PO/2026/010')->count())->toBe(2);
});

test('at least one item is required to create a purchase order', function () {
    $response = $this->post('/admin/purchase-orders', ['items' => []]);

    $response->assertSessionHasErrors('items');
});

test('purchase order item dates quantities and enums are validated', function () {
    $response = $this->post('/admin/purchase-orders', [
        'items' => [validPurchaseOrderItemPayload([
            'delivery_date' => '2026-06-30',
            'received_qty' => 150,
            'status' => 'Shipped',
            'payment_type' => 'Cheque',
        ])],
    ]);

    $response->assertSessionHasErrors([
        'items.0.delivery_date',
        'items.0.received_qty',
        'items.0.status',
        'items.0.payment_type',
    ]);
});

test('a purchase order line can be updated using its masked route key with recalculated balance and variance', function () {
    $purchaseOrder = PurchaseOrder::factory()->create();
    $loaItem = LoaItem::factory()->create();
    $vendor = Vendor::factory()->create();

    $response = $this->put("/admin/purchase-orders/{$purchaseOrder->unique_id}", [
        'po_number' => $purchaseOrder->po_number,
        'order_date' => '2026-07-01',
        'loa_id' => $loaItem->loa_id,
        'loa_item_id' => $loaItem->id,
        'vendor_id' => $vendor->id,
        'ordered_qty' => 200,
        'received_qty' => 200,
        'unit_price_incl_gst' => 118,
        'unit_price_excl_gst' => 100,
        'agreed_rate' => 100,
        'total_price_incl_gst' => 23600,
        'total_price_excl_gst' => 20000,
        'vendor_quote_price' => 90,
        'delivery_date' => '2026-08-01',
        'status' => 'Fully Received',
        'payment_type' => 'Cash',
    ]);

    $response->assertRedirect('/admin/purchase-orders');
    $response->assertSessionDoesntHaveErrors();

    $purchaseOrder->refresh();

    expect($purchaseOrder->status)->toBe('Fully Received')
        ->and((float) $purchaseOrder->balance_qty)->toBe(0.0)
        ->and((float) $purchaseOrder->variance_percentage)->toBe(-10.0);
});

test('a purchase order line is logically deleted', function () {
    $purchaseOrder = PurchaseOrder::factory()->create();

    $this->delete("/admin/purchase-orders/{$purchaseOrder->unique_id}")
        ->assertRedirect('/admin/purchase-orders');

    expect($purchaseOrder->refresh()->is_delete)->toBeTrue();
    $this->assertDatabaseHas('purchase_orders', ['id' => $purchaseOrder->id]);
});

test('the purchase order index returns active records and status stats', function () {
    PurchaseOrder::factory()->create([
        'total_price_incl_gst' => 1000,
        'status' => 'Fully Received',
    ]);
    PurchaseOrder::factory()->create([
        'total_price_incl_gst' => 2500,
        'status' => 'Placed',
    ]);
    PurchaseOrder::factory()->create([
        'total_price_incl_gst' => 9000,
        'status' => 'Not Placed',
        'is_delete' => true,
    ]);

    $this->get('/admin/purchase-orders')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/purchase-orders/index')
            ->has('purchaseOrders.data', 2)
            ->where('stats.total_pos', 2)
            ->where('stats.total_value', fn (string $value): bool => (float) $value === 3500.0)
            ->where('stats.fully_received', 1)
            ->where('stats.pending', 1));
});

test('the migration makes purchase orders available under project setup without seeding', function () {
    $projectSetup = UserScreen::query()
        ->where('folder_name', 'project-setup')
        ->whereNull('main_screen_id')
        ->firstOrFail();

    $purchaseOrders = UserScreen::query()
        ->where('folder_name', 'purchase-orders')
        ->where('main_screen_id', $projectSetup->id)
        ->firstOrFail();

    expect($projectSetup->status)->toBeTrue()
        ->and($projectSetup->is_delete)->toBeFalse()
        ->and($purchaseOrders->screen_name)->toBe('Purchase Orders')
        ->and($purchaseOrders->status)->toBeTrue()
        ->and($purchaseOrders->is_delete)->toBeFalse();
});
