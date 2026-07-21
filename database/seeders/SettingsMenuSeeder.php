<?php

namespace Database\Seeders;

use App\Models\UserScreen;
use Illuminate\Database\Seeder;

class SettingsMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = UserScreen::query()->firstOrCreate(
            ['folder_name' => 'settings', 'main_screen_id' => null],
            [
                'screen_name' => 'Settings',
                'order_no' => 3,
                'icon' => 'settings',
                'description' => 'Master data used across the application.',
                'status' => true,
                'can_add' => true,
                'can_update' => true,
                'can_list' => true,
                'can_delete' => true,
                'can_view' => true,
                'can_cancel' => true,
            ],
        );

        $children = [
            ['screen_name' => 'State', 'folder_name' => 'states', 'order_no' => 1, 'icon' => 'map'],
            ['screen_name' => 'District', 'folder_name' => 'districts', 'order_no' => 2, 'icon' => 'map'],
            ['screen_name' => 'City', 'folder_name' => 'cities', 'order_no' => 3, 'icon' => 'map'],
            ['screen_name' => 'Zone', 'folder_name' => 'zones', 'order_no' => 4, 'icon' => 'building'],
            ['screen_name' => 'Division', 'folder_name' => 'divisions', 'order_no' => 5, 'icon' => 'building'],
            ['screen_name' => 'Station', 'folder_name' => 'stations', 'order_no' => 6, 'icon' => 'train'],
            ['screen_name' => 'Customer', 'folder_name' => 'customers', 'order_no' => 7, 'icon' => 'user'],
            ['screen_name' => 'Vendor', 'folder_name' => 'vendors', 'order_no' => 8, 'icon' => 'building'],
        ];

        foreach ($children as $child) {
            UserScreen::query()->firstOrCreate(
                ['folder_name' => $child['folder_name'], 'main_screen_id' => $settings->id],
                [
                    'screen_name' => $child['screen_name'],
                    'order_no' => $child['order_no'],
                    'icon' => $child['icon'],
                    'status' => true,
                    'can_add' => true,
                    'can_update' => true,
                    'can_list' => true,
                    'can_delete' => true,
                    'can_view' => true,
                    'can_cancel' => true,
                ],
            );
        }

        $subSettings = UserScreen::query()->firstOrCreate(
            ['folder_name' => 'sub-settings', 'main_screen_id' => null],
            [
                'screen_name' => 'Sub Setting',
                'order_no' => 4,
                'icon' => 'settings',
                'description' => 'Additional master data used across projects.',
                'status' => true,
                'can_add' => true,
                'can_update' => true,
                'can_list' => true,
                'can_delete' => true,
                'can_view' => true,
                'can_cancel' => true,
            ],
        );

        $subChildren = [
            ['screen_name' => 'Activities', 'folder_name' => 'activities', 'order_no' => 1, 'icon' => 'list'],
            ['screen_name' => 'Engineer Types', 'folder_name' => 'engineer-types', 'order_no' => 2, 'icon' => 'user'],
            ['screen_name' => 'Unit Creation', 'folder_name' => 'units', 'order_no' => 3, 'icon' => 'grid'],
            ['screen_name' => 'Department', 'folder_name' => 'departments', 'order_no' => 4, 'icon' => 'building'],
            ['screen_name' => 'Project Creation', 'folder_name' => 'projects', 'order_no' => 5, 'icon' => 'folder'],
            ['screen_name' => 'Schedule Name', 'folder_name' => 'schedule-names', 'order_no' => 6, 'icon' => 'list'],
            ['screen_name' => 'Schedule Type', 'folder_name' => 'schedule-types', 'order_no' => 7, 'icon' => 'list'],
            ['screen_name' => 'Engineer Master', 'folder_name' => 'engineers', 'order_no' => 8, 'icon' => 'users'],
        ];

        foreach ($subChildren as $child) {
            UserScreen::query()->firstOrCreate(
                ['folder_name' => $child['folder_name'], 'main_screen_id' => $subSettings->id],
                [
                    'screen_name' => $child['screen_name'],
                    'order_no' => $child['order_no'],
                    'icon' => $child['icon'],
                    'status' => true,
                    'can_add' => true,
                    'can_update' => true,
                    'can_list' => true,
                    'can_delete' => true,
                    'can_view' => true,
                    'can_cancel' => true,
                ],
            );
        }

        $projectSetup = UserScreen::query()->firstOrCreate(
            ['folder_name' => 'project-setup', 'main_screen_id' => null],
            [
                'screen_name' => 'Project Setup',
                'order_no' => 5,
                'icon' => 'folder',
                'description' => 'Project setup and LOA (contract award) management.',
                'status' => true,
                'can_add' => true,
                'can_update' => true,
                'can_list' => true,
                'can_delete' => true,
                'can_view' => true,
                'can_cancel' => true,
            ],
        );

        // The LOA screen previously lived as its own top-level "LOA / PO Management"
        // entry. Move it under Project Setup and rename it instead of leaving the
        // old entry behind, in case it already exists from an earlier seed/install.
        UserScreen::query()
            ->where('folder_name', 'loas')
            ->whereNull('main_screen_id')
            ->update([
                'screen_name' => 'LOA Management',
                'main_screen_id' => $projectSetup->id,
                'order_no' => 1,
            ]);

        UserScreen::query()->firstOrCreate(
            ['folder_name' => 'loas', 'main_screen_id' => $projectSetup->id],
            [
                'screen_name' => 'LOA Management',
                'order_no' => 1,
                'icon' => 'list',
                'status' => true,
                'can_add' => true,
                'can_update' => true,
                'can_list' => true,
                'can_delete' => true,
                'can_view' => true,
                'can_cancel' => true,
            ],
        );

        UserScreen::query()
            ->where('folder_name', 'purchase-orders')
            ->whereNull('main_screen_id')
            ->update([
                'screen_name' => 'Purchase Orders',
                'main_screen_id' => $projectSetup->id,
                'order_no' => 2,
            ]);

        UserScreen::query()->firstOrCreate(
            ['folder_name' => 'purchase-orders', 'main_screen_id' => $projectSetup->id],
            [
                'screen_name' => 'Purchase Orders',
                'order_no' => 2,
                'icon' => 'list',
                'status' => true,
                'can_add' => true,
                'can_update' => true,
                'can_list' => true,
                'can_delete' => true,
                'can_view' => true,
                'can_cancel' => true,
            ],
        );
    }
}
