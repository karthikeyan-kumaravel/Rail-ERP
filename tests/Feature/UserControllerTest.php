<?php

use App\Models\User;
use App\Models\UserType;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('the users index page renders', function () {
    User::factory()->count(3)->create();

    $response = $this->get('/admin/users');

    $response->assertOk();
});

test('the users index page filters by staff name', function () {
    $userType = UserType::factory()->create();
    User::factory()->create(['name' => 'Kavitha Rajan', 'user_type_id' => $userType->id]);
    User::factory()->create(['name' => 'Someone Else', 'user_type_id' => $userType->id]);

    $response = $this->get('/admin/users?'.http_build_query(['staff_name' => 'Kavitha Rajan']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('users.data.0.name', 'Kavitha Rajan')
        ->where('users.total', 1)
    );
});

test('the users index page filters by user name', function () {
    $userType = UserType::factory()->create();
    User::factory()->create(['username' => 'kavitha.r', 'user_type_id' => $userType->id]);
    User::factory()->create(['username' => 'someone.else', 'user_type_id' => $userType->id]);

    $response = $this->get('/admin/users?'.http_build_query(['user_name' => 'kavitha.r']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('users.data.0.username', 'kavitha.r')
        ->where('users.total', 1)
    );
});

test('the users index page filters by mobile no', function () {
    $userType = UserType::factory()->create();
    User::factory()->create(['mobile_no' => '9876543210', 'user_type_id' => $userType->id]);
    User::factory()->create(['mobile_no' => '9123456780', 'user_type_id' => $userType->id]);

    $response = $this->get('/admin/users?'.http_build_query(['mobile_no' => '9876']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('users.data.0.mobile_no', '9876543210')
        ->where('users.total', 1)
    );
});

test('the user edit page renders with existing users for the mobile number lookup', function () {
    $userType = UserType::factory()->create(['name' => 'Engineer']);
    $user = User::factory()->create([
        'name' => 'Kavitha Rajan',
        'mobile_no' => '9876543210',
        'user_type_id' => $userType->id,
    ]);

    $response = $this->get('/admin/users/'.$user->unique_id.'/edit');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('user.name', 'Kavitha Rajan')
        ->has('existingUsers')
    );

    $existingUsers = $response->viewData('page')['props']['existingUsers'];

    expect(collect($existingUsers)->pluck('mobile_no'))->toContain('9876543210');
});

test('a user cannot delete their own account', function () {
    $currentUser = User::factory()->create();
    $this->actingAs($currentUser);

    $response = $this->delete('/admin/users/'.$currentUser->unique_id);

    $response->assertRedirect('/admin/users');
    expect(User::query()->whereKey($currentUser->id)->exists())->toBeTrue();
    $this->assertAuthenticatedAs($currentUser);
});

test('a user can delete another user', function () {
    $otherUser = User::factory()->create();

    $response = $this->delete('/admin/users/'.$otherUser->unique_id);

    $response->assertRedirect('/admin/users');
    expect(User::query()->whereKey($otherUser->id)->exists())->toBeFalse();
});

test('the user show page renders its details', function () {
    $userType = UserType::factory()->create(['name' => 'Engineer']);
    $user = User::factory()->create([
        'name' => 'Kavitha Rajan',
        'username' => 'kavitha.r',
        'mobile_no' => '9876543210',
        'user_type_id' => $userType->id,
    ]);

    $response = $this->get('/admin/users/'.$user->unique_id);

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('user.name', 'Kavitha Rajan')
        ->where('user.username', 'kavitha.r')
        ->where('user.mobile_no', '9876543210')
        ->where('user.user_type', 'Engineer')
    );
});
