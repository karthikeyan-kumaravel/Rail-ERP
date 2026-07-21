<?php

use App\Models\ScheduleName;
use App\Models\ScheduleType;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a schedule type can be created under a schedule name', function () {
    $scheduleName = ScheduleName::factory()->create();

    $response = $this->post('/admin/schedule-types', [
        'schedule_name_id' => $scheduleName->id,
        'name' => 'Weekly Progress',
        'short_name' => 'WKLY',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/schedule-types');

    $scheduleType = ScheduleType::query()->where('name', 'Weekly Progress')->firstOrFail();

    expect($scheduleType->schedule_name_id)->toBe($scheduleName->id)
        ->and($scheduleType->short_name)->toBe('WKLY')
        ->and($scheduleType->unique_id)->not->toBeNull();
});

test('a duplicate schedule type name under the same schedule name is rejected', function () {
    $scheduleName = ScheduleName::factory()->create();
    ScheduleType::factory()->create(['schedule_name_id' => $scheduleName->id, 'name' => 'Weekly Progress']);

    $response = $this->post('/admin/schedule-types', [
        'schedule_name_id' => $scheduleName->id,
        'name' => 'Weekly Progress',
        'short_name' => 'WK2',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('the same schedule type name is allowed under a different schedule name', function () {
    $firstScheduleName = ScheduleName::factory()->create();
    $secondScheduleName = ScheduleName::factory()->create();
    ScheduleType::factory()->create(['schedule_name_id' => $firstScheduleName->id, 'name' => 'Weekly Progress']);

    $response = $this->post('/admin/schedule-types', [
        'schedule_name_id' => $secondScheduleName->id,
        'name' => 'Weekly Progress',
        'short_name' => 'WKLY',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
});

test('a schedule type is soft deleted', function () {
    $scheduleType = ScheduleType::factory()->create();

    $this->delete("/admin/schedule-types/{$scheduleType->unique_id}");

    expect($scheduleType->refresh()->is_delete)->toBeTrue();
});
