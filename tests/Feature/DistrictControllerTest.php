<?php

use App\Models\City;
use App\Models\District;
use App\Models\State;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a district can be created under a state', function () {
    $state = State::factory()->create();

    $response = $this->post('/admin/districts', [
        'state_id' => $state->id,
        'name' => 'Chennai',
        'code' => 'CHN',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/districts');

    $district = District::query()->where('name', 'Chennai')->firstOrFail();

    expect($district->state_id)->toBe($state->id)
        ->and($district->code)->toBe('CHN')
        ->and($district->active_status)->toBeTrue()
        ->and($district->unique_id)->not->toBeNull();
});

test('a district cannot share a name with a sibling under the same state', function () {
    $state = State::factory()->create();
    District::factory()->create(['state_id' => $state->id, 'name' => 'Salem']);

    $response = $this->post('/admin/districts', [
        'state_id' => $state->id,
        'name' => 'Salem',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('districts under different states may share the same name', function () {
    $firstState = State::factory()->create();
    $secondState = State::factory()->create();
    District::factory()->create(['state_id' => $firstState->id, 'name' => 'Madurai']);

    $response = $this->post('/admin/districts', [
        'state_id' => $secondState->id,
        'name' => 'Madurai',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
});

test('a district with cities cannot be deleted', function () {
    $district = District::factory()->create();
    City::factory()->create(['district_id' => $district->id]);

    $this->delete("/admin/districts/{$district->unique_id}");

    expect($district->refresh()->is_delete)->toBeFalse();
});

test('a district without cities is soft deleted', function () {
    $district = District::factory()->create();

    $this->delete("/admin/districts/{$district->unique_id}");

    expect($district->refresh()->is_delete)->toBeTrue();
});

test('the district show page renders its details', function () {
    $state = State::factory()->create(['name' => 'Tamil Nadu']);
    $district = District::factory()->create(['state_id' => $state->id, 'name' => 'Chennai']);
    City::factory()->count(3)->create(['district_id' => $district->id]);

    $response = $this->get("/admin/districts/{$district->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('district.name', 'Chennai')
        ->where('district.state', 'Tamil Nadu')
        ->where('district.cities_count', 3)
    );
});

test('a district keeps its own name when updated', function () {
    $state = State::factory()->create();
    $district = District::factory()->create(['state_id' => $state->id, 'name' => 'Madurai']);

    $response = $this->put("/admin/districts/{$district->unique_id}", [
        'state_id' => $state->id,
        'name' => 'Madurai',
        'code' => $district->code,
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
    expect($district->refresh()->name)->toBe('Madurai');
});
