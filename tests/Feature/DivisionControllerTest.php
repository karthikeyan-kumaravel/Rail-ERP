<?php

use App\Models\Division;
use App\Models\Station;
use App\Models\User;
use App\Models\Zone;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a division can be created under a zone', function () {
    $zone = Zone::factory()->create();

    $response = $this->post('/admin/divisions', [
        'zone_id' => $zone->id,
        'name' => 'Chennai Division',
        'code' => 'MAS',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/divisions');

    $division = Division::query()->where('name', 'Chennai Division')->firstOrFail();

    expect($division->zone_id)->toBe($zone->id)
        ->and($division->code)->toBe('MAS')
        ->and($division->active_status)->toBeTrue()
        ->and($division->unique_id)->not->toBeNull();
});

test('a duplicate division name under the same zone is rejected', function () {
    $zone = Zone::factory()->create();
    Division::factory()->create(['zone_id' => $zone->id, 'name' => 'Chennai Division']);

    $response = $this->post('/admin/divisions', [
        'zone_id' => $zone->id,
        'name' => 'Chennai Division',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('the same division name is allowed under a different zone', function () {
    $firstZone = Zone::factory()->create();
    $secondZone = Zone::factory()->create();
    Division::factory()->create(['zone_id' => $firstZone->id, 'name' => 'Chennai Division']);

    $response = $this->post('/admin/divisions', [
        'zone_id' => $secondZone->id,
        'name' => 'Chennai Division',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
});

test('a division with stations cannot be deleted', function () {
    $division = Division::factory()->create();
    Station::factory()->create(['division_id' => $division->id]);

    $this->delete("/admin/divisions/{$division->unique_id}");

    expect($division->refresh()->is_delete)->toBeFalse();
});

test('a division without stations is soft deleted', function () {
    $division = Division::factory()->create();

    $this->delete("/admin/divisions/{$division->unique_id}");

    expect($division->refresh()->is_delete)->toBeTrue();
});

test('the division show page renders its details', function () {
    $zone = Zone::factory()->create(['name' => 'Southern Railway']);
    $division = Division::factory()->create(['zone_id' => $zone->id, 'name' => 'Chennai Division']);
    Station::factory()->count(2)->create(['division_id' => $division->id]);

    $response = $this->get("/admin/divisions/{$division->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('division.name', 'Chennai Division')
        ->where('division.zone', 'Southern Railway')
        ->where('division.stations_count', 2)
    );
});

test('a division keeps its own name when updated', function () {
    $zone = Zone::factory()->create();
    $division = Division::factory()->create(['zone_id' => $zone->id, 'name' => 'Chennai Division']);

    $response = $this->put("/admin/divisions/{$division->unique_id}", [
        'zone_id' => $zone->id,
        'name' => 'Chennai Division',
        'code' => $division->code,
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
    expect($division->refresh()->name)->toBe('Chennai Division');
});
