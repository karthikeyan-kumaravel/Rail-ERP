<?php

use App\Models\Unit;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a unit can be created', function () {
    $response = $this->post('/admin/units', [
        'name' => 'Nos',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/units');

    $unit = Unit::query()->where('name', 'Nos')->firstOrFail();

    expect($unit->active_status)->toBeTrue()
        ->and($unit->unique_id)->not->toBeNull();
});

test('a duplicate unit name is rejected', function () {
    Unit::factory()->create(['name' => 'Meter']);

    $response = $this->post('/admin/units', [
        'name' => 'Meter',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('a unit is soft deleted', function () {
    $unit = Unit::factory()->create();

    $this->delete("/admin/units/{$unit->unique_id}");

    expect($unit->refresh()->is_delete)->toBeTrue();
});

test('a unit keeps its own name when updated', function () {
    $unit = Unit::factory()->create(['name' => 'KG']);

    $response = $this->put("/admin/units/{$unit->unique_id}", [
        'name' => 'KG',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
    expect($unit->refresh()->name)->toBe('KG');
});
