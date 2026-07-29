<?php

use App\Models\User;
use App\Models\UserType;

test('the admin dashboard is available from the Admin route', function () {
    $role = UserType::factory()->create([
        'name' => 'Super Admin',
        'active_status' => true,
        'is_delete' => false,
    ]);
    $user = User::factory()->create(['user_type_id' => $role->id]);

    $this->actingAs($user)
        ->get('/admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/dashboard'));
});
