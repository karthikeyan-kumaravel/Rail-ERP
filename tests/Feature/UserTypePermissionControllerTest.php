<?php

use App\Models\User;
use App\Models\UserScreen;
use App\Models\UserType;
use App\Models\UserTypePermission;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('the index page lists active user types', function () {
    $userType = UserType::factory()->create(['name' => 'Supervisor']);
    UserType::factory()->create(['is_delete' => true]);

    $response = $this->get('/admin/user-type-permissions');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/user-type-permissions/index')
        ->has('userTypes', 1)
        ->where('userTypes.0.name', $userType->name));
});

test('the edit page lists every active screen with its saved permissions', function () {
    $userType = UserType::factory()->create();
    $userScreen = UserScreen::factory()->create(['screen_name' => 'Vendor']);
    UserTypePermission::factory()->create([
        'user_type_id' => $userType->id,
        'user_screen_id' => $userScreen->id,
        'can_view' => true,
        'can_add' => false,
    ]);

    $response = $this->get("/admin/user-type-permissions/{$userType->unique_id}/edit");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/user-type-permissions/edit')
        ->where('screens.0.can_view', true)
        ->where('screens.0.can_add', false));
});

test('permissions can be saved for a user type', function () {
    $userType = UserType::factory()->create();
    $userScreen = UserScreen::factory()->create();

    $response = $this->put("/admin/user-type-permissions/{$userType->unique_id}", [
        'permissions' => [
            [
                'user_screen_id' => $userScreen->id,
                'can_view' => true,
                'can_add' => true,
                'can_update' => false,
                'can_delete' => false,
            ],
        ],
    ]);

    $response->assertRedirect('/admin/user-type-permissions');

    $permission = UserTypePermission::query()
        ->where('user_type_id', $userType->id)
        ->where('user_screen_id', $userScreen->id)
        ->firstOrFail();

    expect($permission->can_view)->toBeTrue()
        ->and($permission->can_add)->toBeTrue()
        ->and($permission->can_update)->toBeFalse();
});

test('saving permissions twice updates the existing row instead of duplicating it', function () {
    $userType = UserType::factory()->create();
    $userScreen = UserScreen::factory()->create();

    $payload = [
        'permissions' => [
            [
                'user_screen_id' => $userScreen->id,
                'can_view' => true,
                'can_add' => false,
                'can_update' => false,
                'can_delete' => false,
            ],
        ],
    ];

    $this->put("/admin/user-type-permissions/{$userType->unique_id}", $payload);

    $payload['permissions'][0]['can_add'] = true;
    $this->put("/admin/user-type-permissions/{$userType->unique_id}", $payload);

    $count = UserTypePermission::query()
        ->where('user_type_id', $userType->id)
        ->where('user_screen_id', $userScreen->id)
        ->count();

    $permission = UserTypePermission::query()
        ->where('user_type_id', $userType->id)
        ->where('user_screen_id', $userScreen->id)
        ->firstOrFail();

    expect($count)->toBe(1)
        ->and($permission->can_add)->toBeTrue();
});

test('a permission referencing a deleted screen is rejected', function () {
    $userType = UserType::factory()->create();
    $userScreen = UserScreen::factory()->create(['is_delete' => true]);

    $response = $this->put("/admin/user-type-permissions/{$userType->unique_id}", [
        'permissions' => [
            [
                'user_screen_id' => $userScreen->id,
                'can_view' => true,
            ],
        ],
    ]);

    $response->assertSessionHasErrors('permissions.0.user_screen_id');
});
