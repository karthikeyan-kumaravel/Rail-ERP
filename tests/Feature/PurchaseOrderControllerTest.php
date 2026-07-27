<?php

use App\Models\Loa;
use App\Models\LoaItem;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
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
function validPurchaseOrderHeaderPayload(array $overrides = []): array
{
    return array_merge([
        'po_number' => 'PO/2026/005',
        'order_date' => '2026-07-01',
        'loa_id' => Loa::factory()->create()->id,
        'vendor_id' => Vendor::factory()->create()->id,
        'delivery_date' => '2026-08-15',
        'status' => 'Placed',
        'payment_type' => 'Advance',
    ], $overrides);
}

/**
 * total_price_incl_gst/total_price_excl_gst are derived from the final
 * unit_price × ordered_qty (after overrides are applied) unless the
 * caller explicitly overrides the total itself, so every test payload
 * reconciles against StorePurchaseOrderRequest's total-price check by
 * default — a test that wants to exercise a mismatch passes its own
 * total_price_incl_gst/excl_gst override.
 *
 * @return array<string, mixed>
 */
function validPurchaseOrderItemPayload(LoaItem $loaItem, array $overrides = []): array
{
    $item = array_merge([
        'loa_item_id' => $loaItem->id,
        'ordered_qty' => 40,
        'received_qty' => 10,
        'unit_price_incl_gst' => 118,
        'unit_price_excl_gst' => 100,
        'agreed_rate' => 100,
        'vendor_quote_price' => 110,
    ], $overrides);

    $item['total_price_incl_gst'] = $overrides['total_price_incl_gst']
        ?? round($item['unit_price_incl_gst'] * $item['ordered_qty'], 2);
    $item['total_price_excl_gst'] = $overrides['total_price_excl_gst']
        ?? round($item['unit_price_excl_gst'] * $item['ordered_qty'], 2);

    return $item;
}

test('the create page renders as a standalone route with allocation-aware lookup options', function () {
    $loaItem = LoaItem::factory()->create(['item_quantity' => 1000]);
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
            ->where('loa_items.0.loa_id', $loaItem->loa_id)
            ->where('loa_items.0.available_qty', '1000'));
});

test('the edit page renders the purchase order header with its items using its masked route key', function () {
    $purchaseOrder = PurchaseOrder::factory()->create(['po_number' => 'PO/2026/006']);
    PurchaseOrderItem::factory()->create(['purchase_order_id' => $purchaseOrder->id]);

    $this->get("/admin/purchase-orders/{$purchaseOrder->unique_id}/edit")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/purchase-orders/edit')
            ->where('purchaseOrder.po_number', 'PO/2026/006')
            ->where('purchaseOrder.unique_id', fn (string $value): bool => MaskedIdentifier::decode($value) === $purchaseOrder->getRawOriginal('unique_id'))
            ->has('purchaseOrder.items', 1));
});

test('a purchase order can be created with a header and items, balance qty and variance auto-calculated', function () {
    $loaItem = LoaItem::factory()->create(['item_quantity' => 1000]);

    $response = $this->post('/admin/purchase-orders', [
        ...validPurchaseOrderHeaderPayload(['loa_id' => $loaItem->loa_id]),
        'items' => [validPurchaseOrderItemPayload($loaItem)],
    ]);

    $response->assertRedirect('/admin/purchase-orders');
    $response->assertSessionDoesntHaveErrors();

    $purchaseOrder = PurchaseOrder::query()->where('po_number', 'PO/2026/005')->firstOrFail();
    $item = $purchaseOrder->items()->firstOrFail();

    expect($purchaseOrder->unique_id)->not->toBeNull()
        ->and((float) $item->ordered_qty)->toBe(40.0)
        ->and((float) $item->received_qty)->toBe(10.0)
        ->and((float) $item->balance_qty)->toBe(30.0)
        ->and((float) $item->variance_percentage)->toBe(10.0);
});

test('one PO header can contain multiple PO items and only one list entry is created', function () {
    $loa = Loa::factory()->create();
    $loaItemOne = LoaItem::factory()->create(['loa_id' => $loa->id, 'item_quantity' => 1000]);
    $loaItemTwo = LoaItem::factory()->create(['loa_id' => $loa->id, 'item_quantity' => 1000]);

    $response = $this->post('/admin/purchase-orders', [
        ...validPurchaseOrderHeaderPayload(['po_number' => 'PO/2026/010', 'loa_id' => $loa->id]),
        'items' => [
            validPurchaseOrderItemPayload($loaItemOne),
            validPurchaseOrderItemPayload($loaItemTwo),
        ],
    ]);

    $response->assertRedirect('/admin/purchase-orders');
    $response->assertSessionDoesntHaveErrors();

    expect(PurchaseOrder::query()->where('po_number', 'PO/2026/010')->count())->toBe(1);

    $purchaseOrder = PurchaseOrder::query()->where('po_number', 'PO/2026/010')->firstOrFail();
    expect($purchaseOrder->items()->count())->toBe(2);
});

test('at least one item is required to create a purchase order', function () {
    $response = $this->post('/admin/purchase-orders', [
        ...validPurchaseOrderHeaderPayload(),
        'items' => [],
    ]);

    $response->assertSessionHasErrors('items');
});

test('a purchase order item must belong to the purchase order\'s own LOA', function () {
    $loaOne = Loa::factory()->create();
    $loaTwo = Loa::factory()->create();
    $itemUnderLoaTwo = LoaItem::factory()->create(['loa_id' => $loaTwo->id, 'item_quantity' => 1000]);

    $response = $this->post('/admin/purchase-orders', [
        ...validPurchaseOrderHeaderPayload(['loa_id' => $loaOne->id]),
        'items' => [validPurchaseOrderItemPayload($itemUnderLoaTwo)],
    ]);

    $response->assertSessionHasErrors(['items.0.loa_item_id']);
});

test('a purchase order item\'s total price must reconcile with unit price and ordered quantity', function () {
    $loaItem = LoaItem::factory()->create(['item_quantity' => 1000]);

    $response = $this->post('/admin/purchase-orders', [
        ...validPurchaseOrderHeaderPayload(['loa_id' => $loaItem->loa_id]),
        'items' => [validPurchaseOrderItemPayload($loaItem, ['total_price_incl_gst' => 9999])],
    ]);

    $response->assertSessionHasErrors(['items.0.total_price_incl_gst']);
});

test('two purchase orders cannot share the same PO number', function () {
    PurchaseOrder::factory()->create(['po_number' => 'PO/2026/900']);
    $loaItem = LoaItem::factory()->create(['item_quantity' => 1000]);

    $response = $this->post('/admin/purchase-orders', [
        ...validPurchaseOrderHeaderPayload(['po_number' => 'PO/2026/900', 'loa_id' => $loaItem->loa_id]),
        'items' => [validPurchaseOrderItemPayload($loaItem)],
    ]);

    $response->assertSessionHasErrors(['po_number']);
});

test('purchase order header dates and item quantities and enums are validated', function () {
    $loaItem = LoaItem::factory()->create(['item_quantity' => 1000]);

    $response = $this->post('/admin/purchase-orders', [
        ...validPurchaseOrderHeaderPayload([
            'loa_id' => $loaItem->loa_id,
            'delivery_date' => '2026-06-30',
            'status' => 'Shipped',
            'payment_type' => 'Cheque',
        ]),
        'items' => [validPurchaseOrderItemPayload($loaItem, ['received_qty' => 150])],
    ]);

    $response->assertSessionHasErrors([
        'delivery_date',
        'status',
        'payment_type',
        'items.0.received_qty',
    ]);
});

test('the available quantity for an LOA line item excludes what other active POs already ordered', function () {
    $loaItem = LoaItem::factory()->create(['item_quantity' => 100]);
    $otherPurchaseOrder = PurchaseOrder::factory()->create();
    PurchaseOrderItem::factory()->create([
        'purchase_order_id' => $otherPurchaseOrder->id,
        'loa_item_id' => $loaItem->id,
        'ordered_qty' => 40,
    ]);

    $this->get('/admin/purchase-orders/create')
        ->assertInertia(fn (Assert $page) => $page
            ->where('loa_items.0.available_qty', '60'));
});

test('a purchase order item cannot request more than the available LOA quantity', function () {
    $loaItem = LoaItem::factory()->create(['item_quantity' => 100]);
    $otherPurchaseOrder = PurchaseOrder::factory()->create();
    PurchaseOrderItem::factory()->create([
        'purchase_order_id' => $otherPurchaseOrder->id,
        'loa_item_id' => $loaItem->id,
        'ordered_qty' => 40,
    ]);

    $response = $this->post('/admin/purchase-orders', [
        ...validPurchaseOrderHeaderPayload(['loa_id' => $loaItem->loa_id]),
        'items' => [validPurchaseOrderItemPayload($loaItem, ['ordered_qty' => 61, 'received_qty' => 0])],
    ]);

    $response->assertSessionHasErrors(['items.0.ordered_qty']);
});

test('editing a purchase order excludes its own allocated quantity from the availability check', function () {
    $loaItem = LoaItem::factory()->create(['item_quantity' => 100]);
    $purchaseOrder = PurchaseOrder::factory()->create(['loa_id' => $loaItem->loa_id]);
    PurchaseOrderItem::factory()->create([
        'purchase_order_id' => $purchaseOrder->id,
        'loa_item_id' => $loaItem->id,
        'ordered_qty' => 40,
    ]);

    $response = $this->put("/admin/purchase-orders/{$purchaseOrder->unique_id}", [
        ...validPurchaseOrderHeaderPayload([
            'po_number' => $purchaseOrder->po_number,
            'loa_id' => $loaItem->loa_id,
        ]),
        'items' => [validPurchaseOrderItemPayload($loaItem, ['ordered_qty' => 100, 'received_qty' => 0])],
    ]);

    $response->assertRedirect('/admin/purchase-orders');
    $response->assertSessionDoesntHaveErrors();

    expect((float) $purchaseOrder->items()->firstOrFail()->ordered_qty)->toBe(100.0);
});

test('editing a purchase order still respects allocation held by other purchase orders', function () {
    $loaItem = LoaItem::factory()->create(['item_quantity' => 100]);

    $otherPurchaseOrder = PurchaseOrder::factory()->create();
    PurchaseOrderItem::factory()->create([
        'purchase_order_id' => $otherPurchaseOrder->id,
        'loa_item_id' => $loaItem->id,
        'ordered_qty' => 40,
    ]);

    $purchaseOrder = PurchaseOrder::factory()->create(['loa_id' => $loaItem->loa_id]);
    PurchaseOrderItem::factory()->create([
        'purchase_order_id' => $purchaseOrder->id,
        'loa_item_id' => $loaItem->id,
        'ordered_qty' => 20,
    ]);

    $response = $this->put("/admin/purchase-orders/{$purchaseOrder->unique_id}", [
        ...validPurchaseOrderHeaderPayload([
            'po_number' => $purchaseOrder->po_number,
            'loa_id' => $loaItem->loa_id,
        ]),
        'items' => [validPurchaseOrderItemPayload($loaItem, ['ordered_qty' => 61, 'received_qty' => 0])],
    ]);

    $response->assertSessionHasErrors(['items.0.ordered_qty']);
});

test('updating a purchase order replaces its items', function () {
    $purchaseOrder = PurchaseOrder::factory()->create();
    PurchaseOrderItem::factory()->create(['purchase_order_id' => $purchaseOrder->id]);
    $loaItem = LoaItem::factory()->create(['loa_id' => $purchaseOrder->loa_id, 'item_quantity' => 1000]);

    $response = $this->put("/admin/purchase-orders/{$purchaseOrder->unique_id}", [
        ...validPurchaseOrderHeaderPayload([
            'po_number' => $purchaseOrder->po_number,
            'loa_id' => $purchaseOrder->loa_id,
            'vendor_id' => $purchaseOrder->vendor_id,
        ]),
        'items' => [validPurchaseOrderItemPayload($loaItem, [
            'ordered_qty' => 200,
            'received_qty' => 200,
            'vendor_quote_price' => 90,
        ])],
    ]);

    $response->assertRedirect('/admin/purchase-orders');
    $response->assertSessionDoesntHaveErrors();

    $purchaseOrder->refresh();

    expect($purchaseOrder->items()->count())->toBe(1);

    $item = $purchaseOrder->items()->firstOrFail();

    expect((float) $item->balance_qty)->toBe(0.0)
        ->and((float) $item->variance_percentage)->toBe(-10.0);
});

test('a purchase order is logically deleted while its items remain', function () {
    $purchaseOrder = PurchaseOrder::factory()->create();
    PurchaseOrderItem::factory()->create(['purchase_order_id' => $purchaseOrder->id]);

    $this->delete("/admin/purchase-orders/{$purchaseOrder->unique_id}")
        ->assertRedirect('/admin/purchase-orders');

    expect($purchaseOrder->refresh()->is_delete)->toBeTrue();
    $this->assertDatabaseHas('purchase_orders', ['id' => $purchaseOrder->id]);
    $this->assertDatabaseHas('purchase_order_items', ['purchase_order_id' => $purchaseOrder->id]);
});

test('the purchase order index returns one row per PO with aggregated item stats', function () {
    $poOne = PurchaseOrder::factory()->create(['status' => 'Fully Received', 'order_date' => '2026-06-01']);
    PurchaseOrderItem::factory()->create(['purchase_order_id' => $poOne->id, 'total_price_incl_gst' => 1000]);

    $poTwo = PurchaseOrder::factory()->create(['status' => 'Placed', 'order_date' => '2026-07-01']);
    PurchaseOrderItem::factory()->create(['purchase_order_id' => $poTwo->id, 'total_price_incl_gst' => 1500]);
    PurchaseOrderItem::factory()->create(['purchase_order_id' => $poTwo->id, 'total_price_incl_gst' => 1000]);

    $deletedPurchaseOrder = PurchaseOrder::factory()->create(['status' => 'Not Placed', 'is_delete' => true]);
    PurchaseOrderItem::factory()->create(['purchase_order_id' => $deletedPurchaseOrder->id, 'total_price_incl_gst' => 9000]);

    $this->get('/admin/purchase-orders')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/purchase-orders/index')
            ->has('purchaseOrders.data', 2)
            ->where('stats.total_pos', 2)
            ->where('stats.total_value', fn (string $value): bool => (float) $value === 3500.0)
            ->where('stats.fully_received', 1)
            ->where('stats.pending', 1)
            ->where('purchaseOrders.data.0.items_count', 2));
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
