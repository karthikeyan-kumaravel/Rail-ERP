<?php

use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\UserScreen;
use App\Support\MaskedIdentifier;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

function validPurchaseOrderPayload(array $overrides = []): array
{
    return array_merge([
        'po_number' => 'PO/2026/005',
        'supplier' => 'Hikvision India Pvt Ltd',
        'items_description' => 'IP Camera 2MP (650 Nos)',
        'order_date' => '2026-07-01',
        'amount' => 9500000,
        'delivery_date' => '2026-08-15',
        'payment_terms' => '30 days credit',
        'total_qty' => 650,
        'received_qty' => 520,
        'inspection_status' => 'passed',
        'dispatch_status' => 'partial',
    ], $overrides);
}

test('the create page renders as a standalone route', function () {
    $this->get('/admin/purchase-orders/create')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/purchase-orders/create')
            ->has('status_options.inspection_status')
            ->has('status_options.dispatch_status'));
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

test('a purchase order can be created', function () {
    $response = $this->post('/admin/purchase-orders', validPurchaseOrderPayload());

    $response->assertRedirect('/admin/purchase-orders');

    $purchaseOrder = PurchaseOrder::query()->where('po_number', 'PO/2026/005')->firstOrFail();

    expect($purchaseOrder->supplier)->toBe('Hikvision India Pvt Ltd')
        ->and((float) $purchaseOrder->amount)->toBe(9500000.0)
        ->and($purchaseOrder->total_qty)->toBe(650)
        ->and($purchaseOrder->received_qty)->toBe(520)
        ->and($purchaseOrder->unique_id)->not->toBeNull();
});

test('an active purchase order number must be unique', function () {
    PurchaseOrder::factory()->create(['po_number' => 'PO/2026/005']);

    $response = $this->post('/admin/purchase-orders', validPurchaseOrderPayload());

    $response->assertSessionHasErrors('po_number');
});

test('purchase order dates quantities and statuses are validated', function () {
    $response = $this->post('/admin/purchase-orders', validPurchaseOrderPayload([
        'delivery_date' => '2026-06-30',
        'received_qty' => 651,
        'inspection_status' => 'approved',
        'dispatch_status' => 'shipped',
    ]));

    $response->assertSessionHasErrors([
        'delivery_date',
        'received_qty',
        'inspection_status',
        'dispatch_status',
    ]);
});

test('purchase order storage limits are validated before writing to the database', function () {
    $response = $this->post('/admin/purchase-orders', validPurchaseOrderPayload([
        'amount' => '10000000000000.001',
        'total_qty' => '4294967296',
        'received_qty' => '4294967296',
    ]));

    $response->assertSessionHasErrors(['amount', 'total_qty', 'received_qty']);
});

test('a purchase order can be updated using its masked route key', function () {
    $purchaseOrder = PurchaseOrder::factory()->create(['po_number' => 'PO/2026/004']);

    $response = $this->put("/admin/purchase-orders/{$purchaseOrder->unique_id}", validPurchaseOrderPayload([
        'po_number' => 'PO/2026/004',
        'dispatch_status' => 'completed',
        'received_qty' => 650,
    ]));

    $response->assertRedirect('/admin/purchase-orders');
    $response->assertSessionDoesntHaveErrors();

    expect($purchaseOrder->refresh()->dispatch_status)->toBe('completed')
        ->and($purchaseOrder->received_qty)->toBe(650);
});

test('a purchase order is logically deleted', function () {
    $purchaseOrder = PurchaseOrder::factory()->create();

    $this->delete("/admin/purchase-orders/{$purchaseOrder->unique_id}")
        ->assertRedirect('/admin/purchase-orders');

    expect($purchaseOrder->refresh()->is_delete)->toBeTrue();
});

test('the purchase order index returns active records and dispatch stats', function () {
    PurchaseOrder::factory()->create([
        'amount' => 1000,
        'dispatch_status' => 'completed',
    ]);
    PurchaseOrder::factory()->create([
        'amount' => 2500,
        'dispatch_status' => 'partial',
    ]);
    PurchaseOrder::factory()->create([
        'amount' => 9000,
        'dispatch_status' => 'pending',
        'is_delete' => true,
    ]);

    $this->get('/admin/purchase-orders')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/purchase-orders/index')
            ->has('purchaseOrders.data', 2)
            ->where('stats.total_pos', 2)
            ->where('stats.total_value', fn (string $value): bool => (float) $value === 3500.0)
            ->where('stats.completed', 1)
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
