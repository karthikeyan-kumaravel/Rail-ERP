<?php

use App\Models\District;
use App\Models\State;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a state can be created', function () {
    $response = $this->post('/admin/states', [
        'name' => 'Tamil Nadu',
        'code' => 'TN',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/states');

    $state = State::query()->where('name', 'Tamil Nadu')->firstOrFail();

    expect($state->code)->toBe('TN')
        ->and($state->active_status)->toBeTrue()
        ->and($state->is_delete)->toBeFalse()
        ->and($state->unique_id)->not->toBeNull();
});

test('a duplicate state name is rejected', function () {
    State::factory()->create(['name' => 'Karnataka']);

    $response = $this->post('/admin/states', [
        'name' => 'Karnataka',
        'code' => 'KA',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('a state name reused from a soft-deleted state is accepted', function () {
    State::factory()->create(['name' => 'Kerala', 'is_delete' => true]);

    $response = $this->post('/admin/states', [
        'name' => 'Kerala',
        'code' => 'KL',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
});

test('a state with districts cannot be deleted', function () {
    $state = State::factory()->create();
    District::factory()->create(['state_id' => $state->id]);

    $this->delete("/admin/states/{$state->unique_id}");

    expect($state->refresh()->is_delete)->toBeFalse();
});

test('a state without districts is soft deleted', function () {
    $state = State::factory()->create();

    $this->delete("/admin/states/{$state->unique_id}");

    expect($state->refresh()->is_delete)->toBeTrue();
    expect(State::query()->whereKey($state->id)->exists())->toBeTrue();
});

test('the state show page renders its details', function () {
    $state = State::factory()->create(['name' => 'Tamil Nadu', 'code' => 'TN']);
    District::factory()->count(2)->create(['state_id' => $state->id]);

    $response = $this->get("/admin/states/{$state->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('state.name', 'Tamil Nadu')
        ->where('state.code', 'TN')
        ->where('state.districts_count', 2)
    );
});

test('a state keeps its own name when updated', function () {
    $state = State::factory()->create(['name' => 'Telangana', 'code' => 'TG']);

    $response = $this->put("/admin/states/{$state->unique_id}", [
        'name' => 'Telangana',
        'code' => 'TG',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
    expect($state->refresh()->name)->toBe('Telangana');
});
