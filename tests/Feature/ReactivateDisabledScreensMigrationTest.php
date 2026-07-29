<?php

use App\Models\UserScreen;

function runReactivateDisabledScreensMigration(): void
{
    $migration = require database_path('migrations/2026_07_28_043844_reactivate_incorrectly_disabled_project_and_purchase_order_screens.php');
    $migration->up();
}

test('the migration re-enables an incorrectly disabled projects screen', function () {
    $settings = UserScreen::factory()->create(['folder_name' => 'settings', 'main_screen_id' => null, 'status' => true]);
    $projects = UserScreen::factory()->create([
        'folder_name' => 'projects',
        'main_screen_id' => $settings->id,
        'status' => false,
        'is_delete' => false,
    ]);

    runReactivateDisabledScreensMigration();

    $settingsNode = collect(UserScreen::navigationTree())->firstWhere('folder_name', 'settings');

    expect($projects->fresh()->status)->toBeTrue()
        ->and(collect($settingsNode['children'])->pluck('folder_name'))->toContain('projects');
});

test('the migration re-enables an incorrectly disabled purchase orders screen', function () {
    // The `2026_07_13_000001_add_purchase_orders_screen_to_project_setup`
    // migration already creates an active `project-setup` > `purchase-orders`
    // pair on every fresh migrate — simulate the real-world corruption by
    // disabling that existing screen, rather than creating a duplicate pair.
    $purchaseOrders = UserScreen::query()->where('folder_name', 'purchase-orders')->firstOrFail();
    $purchaseOrders->update(['status' => false]);

    runReactivateDisabledScreensMigration();

    expect($purchaseOrders->fresh()->status)->toBeTrue();
});

test('the migration leaves an intentionally disabled, unrelated screen untouched', function () {
    $orphanedGroup = UserScreen::factory()->create([
        'folder_name' => 'sub-settings',
        'main_screen_id' => null,
        'status' => false,
        'is_delete' => false,
    ]);
    $unrelated = UserScreen::factory()->create([
        'folder_name' => 'projects',
        'main_screen_id' => null,
        'status' => false,
        'is_delete' => false,
    ]);

    runReactivateDisabledScreensMigration();

    expect($orphanedGroup->fresh()->status)->toBeFalse()
        ->and($unrelated->fresh()->status)->toBeFalse();
});
