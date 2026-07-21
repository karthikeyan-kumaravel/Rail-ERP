<?php

use App\Models\EngineerType;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('an engineer type can be created', function () {
    $response = $this->post('/admin/engineer-types', [
        'name' => 'Electrical',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/engineer-types');

    $engineerType = EngineerType::query()->where('name', 'Electrical')->firstOrFail();

    expect($engineerType->active_status)->toBeTrue()
        ->and($engineerType->unique_id)->not->toBeNull();
});

test('a duplicate engineer type name is rejected', function () {
    EngineerType::factory()->create(['name' => 'Civil']);

    $response = $this->post('/admin/engineer-types', [
        'name' => 'Civil',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('an engineer type is soft deleted', function () {
    $engineerType = EngineerType::factory()->create();

    $this->delete("/admin/engineer-types/{$engineerType->unique_id}");

    expect($engineerType->refresh()->is_delete)->toBeTrue();
});

test('an engineer type keeps its own name when updated', function () {
    $engineerType = EngineerType::factory()->create(['name' => 'Telecom']);

    $response = $this->put("/admin/engineer-types/{$engineerType->unique_id}", [
        'name' => 'Telecom',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
    expect($engineerType->refresh()->name)->toBe('Telecom');
});
