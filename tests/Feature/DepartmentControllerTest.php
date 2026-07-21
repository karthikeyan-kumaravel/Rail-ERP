<?php

use App\Models\Department;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a department can be created', function () {
    $response = $this->post('/admin/departments', [
        'name' => 'HR',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/departments');

    $department = Department::query()->where('name', 'HR')->firstOrFail();

    expect($department->active_status)->toBeTrue()
        ->and($department->unique_id)->not->toBeNull();
});

test('a duplicate department name is rejected', function () {
    Department::factory()->create(['name' => 'Finance']);

    $response = $this->post('/admin/departments', [
        'name' => 'Finance',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('a department is soft deleted', function () {
    $department = Department::factory()->create();

    $this->delete("/admin/departments/{$department->unique_id}");

    expect($department->refresh()->is_delete)->toBeTrue();
});

test('a department keeps its own name when updated', function () {
    $department = Department::factory()->create(['name' => 'Billing']);

    $response = $this->put("/admin/departments/{$department->unique_id}", [
        'name' => 'Billing',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
    expect($department->refresh()->name)->toBe('Billing');
});
