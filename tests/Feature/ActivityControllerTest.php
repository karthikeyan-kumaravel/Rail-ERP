<?php

use App\Models\Activity;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('an activity can be created', function () {
    $response = $this->post('/admin/activities', [
        'name' => 'Survey',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/activities');

    $activity = Activity::query()->where('name', 'Survey')->firstOrFail();

    expect($activity->active_status)->toBeTrue()
        ->and($activity->unique_id)->not->toBeNull();
});

test('a duplicate activity name is rejected', function () {
    Activity::factory()->create(['name' => 'Drawing']);

    $response = $this->post('/admin/activities', [
        'name' => 'Drawing',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('an activity is soft deleted', function () {
    $activity = Activity::factory()->create();

    $this->delete("/admin/activities/{$activity->unique_id}");

    expect($activity->refresh()->is_delete)->toBeTrue();
});

test('an activity keeps its own name when updated', function () {
    $activity = Activity::factory()->create(['name' => 'Cabling']);

    $response = $this->put("/admin/activities/{$activity->unique_id}", [
        'name' => 'Cabling',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
    expect($activity->refresh()->name)->toBe('Cabling');
});
