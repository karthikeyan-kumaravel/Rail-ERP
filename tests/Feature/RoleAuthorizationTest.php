<?php

use App\Models\User;
use App\Models\UserScreen;
use App\Models\UserType;
use App\Models\UserTypePermission;

beforeEach(function () {
    $this->userType = UserType::factory()->create(['name' => 'Admin', 'active_status' => true, 'is_delete' => false]);
    $this->admin = User::factory()->create([
        'user_type_id' => $this->userType->id,
        'name' => 'Admin User',
        'email' => 'admin@example.com',
    ]);
});

test('admin users cannot open edit pages for admin resources', function () {
    $this->actingAs($this->admin);
    $screen = UserScreen::factory()->create();

    $response = $this->get("/admin/user-screens/{$screen->unique_id}/edit");

    $response->assertForbidden();
});

test('admin users cannot send delete requests for admin resources', function () {
    $this->actingAs($this->admin);
    $screen = UserScreen::factory()->create();

    $response = $this->delete("/admin/user-screens/{$screen->unique_id}");

    $response->assertForbidden();
});

test('non-admin users can view the role screen but cannot edit it when update is disabled', function () {
    $role = UserType::factory()->create(['name' => 'Accounts Team', 'active_status' => true, 'is_delete' => false]);
    $screen = UserScreen::factory()->create(['folder_name' => 'user-types', 'main_screen_id' => null, 'status' => true, 'is_delete' => false]);
    UserTypePermission::factory()->create([
        'user_type_id' => $role->id,
        'user_screen_id' => $screen->id,
        'can_view' => true,
        'can_add' => false,
        'can_update' => false,
        'can_delete' => false,
        'is_delete' => false,
    ]);

    $user = User::factory()->create([
        'user_type_id' => $role->id,
        'name' => 'Accounts User',
        'email' => 'accounts@example.com',
    ]);

    $this->actingAs($user);

    $this->get('/admin/user-types')->assertOk();
    $this->get("/admin/user-types/{$role->unique_id}")->assertOk();
    $this->get("/admin/user-types/{$role->unique_id}/edit")->assertForbidden();
});
