<?php

use App\Models\Customer;
use App\Models\ImportLog;
use App\Models\User;
use App\Models\Vendor;
use App\Support\MaskedIdentifier;

it('generates masked route keys and resolves them for admin routes', function (): void {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();

    $url = route('admin.customers.edit', ['customer' => $customer->getRouteKey()]);

    expect($url)
        ->toContain('/admin/customers/')
        ->not->toContain((string) $customer->unique_id);

    $this->actingAs($user)
        ->get($url)
        ->assertOk();
});

it('returns a not found response for tampered masked route keys', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/admin/customers/not-a-valid-mask/edit')
        ->assertNotFound();
});

it('returns a not found response when the raw database id or unique_id is used instead of the mask', function (): void {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();

    $this->actingAs($user);

    $this->get("/admin/customers/{$customer->id}/edit")->assertNotFound();
    $this->get('/admin/customers/'.$customer->getRawOriginal('unique_id').'/edit')->assertNotFound();
});

it('does not resolve a masked key from a different model', function (): void {
    $user = User::factory()->create();
    $vendor = Vendor::factory()->create();

    // A mask minted for a Vendor must not resolve when presented to the Customer route.
    $this->actingAs($user)
        ->get("/admin/customers/{$vendor->getRouteKey()}/edit")
        ->assertNotFound();
});

it('returns a not found response for an expired masked identifier', function (): void {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();

    $expiredMask = MaskedIdentifier::encode($customer->getRawOriginal('unique_id'), -10);

    $this->actingAs($user)
        ->get("/admin/customers/{$expiredMask}/edit")
        ->assertNotFound();
});

it('mints a different masked token each time even for the same underlying record', function (): void {
    $customer = Customer::factory()->create();

    $first = $customer->getRouteKey();
    $second = $customer->getRouteKey();

    expect($first)->not->toBe($second)
        ->and(MaskedIdentifier::decode($first))->toBe(MaskedIdentifier::decode($second));
});

it('masks the raw integer id for models without a unique_id column, like ImportLog', function (): void {
    $log = ImportLog::query()->create(['module' => 'customers']);

    $mask = $log->getRouteKey();

    expect($mask)->not->toBe((string) $log->id)
        ->and(MaskedIdentifier::decode($mask))->toBe((string) $log->id);
});
