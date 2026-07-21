<?php

use App\Models\ScheduleName;
use App\Models\ScheduleType;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a schedule name can be created', function () {
    $response = $this->post('/admin/schedule-names', [
        'name' => 'Mobilization Schedule',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/schedule-names');

    $scheduleName = ScheduleName::query()->where('name', 'Mobilization Schedule')->firstOrFail();

    expect($scheduleName->active_status)->toBeTrue()
        ->and($scheduleName->unique_id)->not->toBeNull();
});

test('a duplicate schedule name is rejected', function () {
    ScheduleName::factory()->create(['name' => 'Completion Schedule']);

    $response = $this->post('/admin/schedule-names', [
        'name' => 'Completion Schedule',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('a schedule name with schedule types cannot be deleted', function () {
    $scheduleName = ScheduleName::factory()->create();
    ScheduleType::factory()->create(['schedule_name_id' => $scheduleName->id]);

    $this->delete("/admin/schedule-names/{$scheduleName->unique_id}");

    expect($scheduleName->refresh()->is_delete)->toBeFalse();
});

test('a schedule name without schedule types is soft deleted', function () {
    $scheduleName = ScheduleName::factory()->create();

    $this->delete("/admin/schedule-names/{$scheduleName->unique_id}");

    expect($scheduleName->refresh()->is_delete)->toBeTrue();
});
