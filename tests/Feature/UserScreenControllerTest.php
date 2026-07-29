<?php

use App\Models\User;
use App\Models\UserScreen;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a main screen can be created', function () {
    $response = $this->post('/admin/user-screens', [
        'main_screen_id' => null,
        'screen_name' => 'Admin',
        'folder_name' => 'admin',
        'order_no' => 1,
        'icon' => 'admin',
        'description' => 'Admin section',
        'status' => '1',
        'can_add' => true,
        'can_update' => true,
        'can_list' => true,
        'can_delete' => false,
        'can_view' => true,
        'can_cancel' => false,
    ]);

    $response->assertRedirect('/admin/user-screens');

    $userScreen = UserScreen::query()->where('screen_name', 'Admin')->firstOrFail();

    expect($userScreen->main_screen_id)->toBeNull()
        ->and($userScreen->folder_name)->toBe('admin')
        ->and($userScreen->can_add)->toBeTrue()
        ->and($userScreen->can_delete)->toBeFalse()
        ->and($userScreen->unique_id)->not->toBeNull();
});

test('a sub screen can be created under a main screen', function () {
    $mainScreen = UserScreen::factory()->create(['main_screen_id' => null]);

    $response = $this->post('/admin/user-screens', [
        'main_screen_id' => $mainScreen->id,
        'screen_name' => 'User Type',
        'folder_name' => 'user-types',
        'order_no' => 2,
        'icon' => 'users',
        'status' => '1',
    ]);

    $response->assertRedirect('/admin/user-screens');

    $userScreen = UserScreen::query()->where('screen_name', 'User Type')->firstOrFail();

    expect($userScreen->main_screen_id)->toBe($mainScreen->id);
});

test('an invalid icon is rejected', function () {
    $response = $this->post('/admin/user-screens', [
        'screen_name' => 'Broken',
        'folder_name' => 'broken',
        'order_no' => 1,
        'icon' => 'not-a-real-icon',
        'status' => '1',
    ]);

    $response->assertSessionHasErrors('icon');
});

test('a screen cannot be assigned as its own main screen', function () {
    $userScreen = UserScreen::factory()->create(['main_screen_id' => null]);

    $response = $this->put("/admin/user-screens/{$userScreen->unique_id}", [
        'main_screen_id' => $userScreen->id,
        'screen_name' => $userScreen->screen_name,
        'folder_name' => $userScreen->folder_name,
        'order_no' => $userScreen->order_no,
        'icon' => $userScreen->icon,
        'status' => '1',
    ]);

    $response->assertSessionHasErrors('main_screen_id');
});

test('a screen with sub screens cannot be deleted', function () {
    $mainScreen = UserScreen::factory()->create(['main_screen_id' => null]);
    UserScreen::factory()->create(['main_screen_id' => $mainScreen->id]);

    $this->delete("/admin/user-screens/{$mainScreen->unique_id}");

    expect($mainScreen->refresh()->is_delete)->toBeFalse();
});

test('a screen without sub screens is soft deleted', function () {
    $userScreen = UserScreen::factory()->create(['main_screen_id' => null]);

    $this->delete("/admin/user-screens/{$userScreen->unique_id}");

    expect($userScreen->refresh()->is_delete)->toBeTrue();
});

test('a screen cannot share an order number with a sibling under the same parent', function () {
    $mainScreen = UserScreen::factory()->create(['main_screen_id' => null]);
    UserScreen::factory()->create(['main_screen_id' => $mainScreen->id, 'order_no' => 5]);

    $response = $this->post('/admin/user-screens', [
        'main_screen_id' => $mainScreen->id,
        'screen_name' => 'Duplicate Order',
        'folder_name' => 'duplicate-order',
        'order_no' => 5,
        'icon' => 'grid',
        'status' => '1',
    ]);

    $response->assertSessionHasErrors('order_no');
});

test('sibling screens under different parents may share the same order number', function () {
    $firstMainScreen = UserScreen::factory()->create(['main_screen_id' => null, 'order_no' => 1]);
    UserScreen::factory()->create(['main_screen_id' => $firstMainScreen->id, 'order_no' => 5]);

    $response = $this->post('/admin/user-screens', [
        'main_screen_id' => null,
        'screen_name' => 'Second Main',
        'folder_name' => 'second-main',
        'order_no' => 5,
        'icon' => 'grid',
        'status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('order_no');
});

test('an empty order number is rejected', function () {
    $response = $this->post('/admin/user-screens', [
        'screen_name' => 'No Order',
        'folder_name' => 'no-order',
        'order_no' => '',
        'icon' => 'grid',
        'status' => '1',
    ]);

    $response->assertSessionHasErrors('order_no');
});

test('a screen keeps its own order number when updated', function () {
    $userScreen = UserScreen::factory()->create(['main_screen_id' => null, 'order_no' => 3]);

    $response = $this->put("/admin/user-screens/{$userScreen->unique_id}", [
        'main_screen_id' => null,
        'screen_name' => 'Renamed',
        'folder_name' => $userScreen->folder_name,
        'order_no' => 3,
        'icon' => $userScreen->icon,
        'status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('order_no');
    expect($userScreen->refresh()->screen_name)->toBe('Renamed');
});

test('the sidebar navigation tree is ordered by order_no and reflects changes', function () {
    $mainScreen = UserScreen::factory()->create([
        'main_screen_id' => null,
        'screen_name' => 'Admin',
        'folder_name' => 'admin',
        'order_no' => 1,
    ]);

    $userTypeScreen = UserScreen::factory()->create([
        'main_screen_id' => $mainScreen->id,
        'screen_name' => 'User Type',
        'folder_name' => 'user-types',
        'order_no' => 2,
    ]);

    $userScreen = UserScreen::factory()->create([
        'main_screen_id' => $mainScreen->id,
        'screen_name' => 'User',
        'folder_name' => 'users',
        'order_no' => 1,
    ]);

    $tree = UserScreen::navigationTree();

    expect($tree)->toHaveCount(1)
        ->and($tree[0]['folder_name'])->toBe('admin')
        ->and($tree[0]['children'])->toHaveCount(2)
        ->and($tree[0]['children'][0]['folder_name'])->toBe('users')
        ->and($tree[0]['children'][1]['folder_name'])->toBe('user-types');

    $this->put("/admin/user-screens/{$userScreen->unique_id}", [
        'main_screen_id' => $mainScreen->id,
        'screen_name' => $userScreen->screen_name,
        'folder_name' => $userScreen->folder_name,
        'order_no' => 3,
        'icon' => $userScreen->icon,
        'status' => '1',
    ])->assertSessionDoesntHaveErrors();

    $updatedTree = UserScreen::navigationTree();

    expect($updatedTree[0]['children'][0]['folder_name'])->toBe('user-types')
        ->and($updatedTree[0]['children'][1]['folder_name'])->toBe('users');
});

test('the user screen show page renders its details', function () {
    $mainScreen = UserScreen::factory()->create(['main_screen_id' => null, 'screen_name' => 'Admin']);
    $userScreen = UserScreen::factory()->create([
        'main_screen_id' => $mainScreen->id,
        'screen_name' => 'Users',
        'folder_name' => 'users',
        'icon' => 'users',
        'can_add' => true,
        'can_delete' => false,
    ]);

    $response = $this->get("/admin/user-screens/{$userScreen->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('userScreen.screen_name', 'Users')
        ->where('userScreen.main_screen', 'Admin')
        ->where('userScreen.can_add', true)
        ->where('userScreen.can_delete', false)
    );
});

test('inactive and soft-deleted screens are excluded from the navigation tree', function () {
    UserScreen::factory()->create(['main_screen_id' => null, 'status' => false]);
    UserScreen::factory()->create(['main_screen_id' => null, 'is_delete' => true]);
    $visible = UserScreen::factory()->create(['main_screen_id' => null, 'status' => true, 'is_delete' => false]);

    $tree = UserScreen::navigationTree();

    expect($tree)->toHaveCount(1)
        ->and($tree[0]['folder_name'])->toBe($visible->folder_name);
});
