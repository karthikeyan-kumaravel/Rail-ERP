<?php

use App\Models\User;
use App\Models\UserScreen;
use App\Models\UserType;
use App\Models\UserTypePermission;
use Database\Seeders\UserTypePermissionSeeder;

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

test('accounts team can only view its permitted modules', function () {
    $role = UserType::factory()->create(['name' => 'Accounts Team', 'active_status' => true, 'is_delete' => false]);
    $screen = UserScreen::factory()->create(['folder_name' => 'customers', 'main_screen_id' => null, 'status' => true, 'is_delete' => false]);
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

    $this->get('/admin/customers')->assertOk();
    $this->get('/admin/alerts')->assertOk();
    $this->get('/admin/settings')->assertOk();
    $this->get('/admin/user-types')->assertForbidden();
    $this->post('/admin/customers', [])->assertForbidden();
});

test('operation team can only view alerts and settings modules', function () {
    $role = UserType::factory()->create(['name' => 'Operation Team', 'active_status' => true, 'is_delete' => false]);
    $user = User::factory()->create([
        'user_type_id' => $role->id,
        'name' => 'Operation User',
        'email' => 'operation@example.com',
    ]);

    $this->actingAs($user);

    $this->get('/dashboard')->assertOk();
    $this->get('/admin/alerts')->assertOk();
    $this->get('/admin/settings')->assertOk();
    $this->get('/admin/states')->assertOk();
    $this->get('/admin/projects')->assertOk();
    $this->get('/admin/user-types')->assertForbidden();
    $this->get('/admin/loas')->assertForbidden();
    $this->post('/admin/states', [])->assertForbidden();
});

test('service engineer can only view permitted settings and project setup modules', function () {
    $role = UserType::factory()->create(['name' => 'Service Engineer', 'active_status' => true, 'is_delete' => false]);
    $user = User::factory()->create([
        'user_type_id' => $role->id,
        'name' => 'Service Engineer User',
        'email' => 'service-engineer@example.com',
    ]);

    $this->actingAs($user);

    $this->get('/dashboard')->assertOk();
    $this->get('/admin/alerts')->assertOk();
    $this->get('/admin/settings')->assertOk();
    $this->get('/admin/stations')->assertOk();
    $this->get('/admin/departments')->assertOk();
    $this->get('/admin/loas')->assertOk();
    $this->get('/admin/purchase-orders')->assertOk();
    $this->get('/admin/customers')->assertForbidden();
    $this->get('/admin/projects')->assertForbidden();
    $this->post('/admin/stations', [])->assertForbidden();
});

test('UserTypePermissionSeeder grants operational roles add access on every active screen', function () {
    $accountsTeam = UserType::factory()->create(['name' => 'Accounts Team', 'is_delete' => false]);
    $screen = UserScreen::factory()->create(['folder_name' => 'departments', 'is_delete' => false, 'status' => true]);

    (new UserTypePermissionSeeder)->run();

    $permission = UserTypePermission::query()
        ->where('user_type_id', $accountsTeam->id)
        ->where('user_screen_id', $screen->id)
        ->firstOrFail();

    expect($permission->can_view)->toBeTrue()
        ->and($permission->can_add)->toBeTrue()
        ->and($permission->can_update)->toBeFalse()
        ->and($permission->can_delete)->toBeFalse();

    $user = User::factory()->create(['user_type_id' => $accountsTeam->id]);
    $this->actingAs($user);

    $response = $this->post('/admin/departments', ['name' => 'Accounts Dept', 'active_status' => '1']);

    $response->assertRedirect('/admin/departments');
});

test('UserTypePermissionSeeder does not overwrite an already-configured permission row', function () {
    $accountsTeam = UserType::factory()->create(['name' => 'Accounts Team', 'is_delete' => false]);
    $screen = UserScreen::factory()->create(['folder_name' => 'departments', 'is_delete' => false, 'status' => true]);

    UserTypePermission::factory()->create([
        'user_type_id' => $accountsTeam->id,
        'user_screen_id' => $screen->id,
        'can_view' => true,
        'can_add' => false,
        'can_update' => false,
        'can_delete' => false,
    ]);

    (new UserTypePermissionSeeder)->run();

    $count = UserTypePermission::query()
        ->where('user_type_id', $accountsTeam->id)
        ->where('user_screen_id', $screen->id)
        ->count();

    $permission = UserTypePermission::query()
        ->where('user_type_id', $accountsTeam->id)
        ->where('user_screen_id', $screen->id)
        ->firstOrFail();

    expect($count)->toBe(1)
        ->and($permission->can_add)->toBeFalse();
});
