<?php

use App\Models\Division;
use App\Models\User;
use App\Models\Zone;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a zone can be created', function () {
    $response = $this->post('/admin/zones', [
        'name' => 'Southern Railway',
        'code' => 'SR',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/zones');

    $zone = Zone::query()->where('name', 'Southern Railway')->firstOrFail();

    expect($zone->code)->toBe('SR')
        ->and($zone->active_status)->toBeTrue()
        ->and($zone->unique_id)->not->toBeNull();
});

test('a duplicate zone name is rejected', function () {
    Zone::factory()->create(['name' => 'Western Railway']);

    $response = $this->post('/admin/zones', [
        'name' => 'Western Railway',
        'code' => 'WR2',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('a zone with divisions cannot be deleted', function () {
    $zone = Zone::factory()->create();
    Division::factory()->create(['zone_id' => $zone->id]);

    $this->delete("/admin/zones/{$zone->unique_id}");

    expect($zone->refresh()->is_delete)->toBeFalse();
});

test('a zone without divisions is soft deleted', function () {
    $zone = Zone::factory()->create();

    $this->delete("/admin/zones/{$zone->unique_id}");

    expect($zone->refresh()->is_delete)->toBeTrue();
});

test('the zone show page renders its details', function () {
    $zone = Zone::factory()->create(['name' => 'Southern Railway', 'code' => 'SR']);
    Division::factory()->count(2)->create(['zone_id' => $zone->id]);

    $response = $this->get("/admin/zones/{$zone->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('zone.name', 'Southern Railway')
        ->where('zone.code', 'SR')
        ->where('zone.divisions_count', 2)
    );
});

test('a zone keeps its own name when updated', function () {
    $zone = Zone::factory()->create(['name' => 'Eastern Railway', 'code' => 'ER']);

    $response = $this->put("/admin/zones/{$zone->unique_id}", [
        'name' => 'Eastern Railway',
        'code' => 'ER',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors();
    expect($zone->refresh()->name)->toBe('Eastern Railway');
});
