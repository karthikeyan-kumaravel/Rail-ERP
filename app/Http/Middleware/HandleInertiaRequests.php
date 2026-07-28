<?php

namespace App\Http\Middleware;

use App\Models\Alert;
use App\Models\UserScreen;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user()?->load('userType');
        $roleName = strtolower((string) ($user?->userType?->name ?? ''));
        $isSuperAdmin = $roleName === 'super admin';
        $isAdmin = $roleName === 'admin';
        $isAccountsTeam = $roleName === 'accounts team';
        $isOperationTeam = $roleName === 'operation team';
        $isServiceEngineer = $roleName === 'service engineer';
        $navigation = $user ? UserScreen::navigationTree() : [];

        if ($isOperationTeam) {
            $navigation = $this->operationNavigation($navigation);
        }

        if ($isServiceEngineer) {
            $navigation = $this->serviceEngineerNavigation($navigation);
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'role' => $user?->userType?->name,
                'isSuperAdmin' => $isSuperAdmin,
                'isAdmin' => $isAdmin,
                'isAccountsTeam' => $isAccountsTeam,
                'isOperationTeam' => $isOperationTeam,
                'isServiceEngineer' => $isServiceEngineer,
                'canCreate' => $isSuperAdmin || $isAdmin,
                'canEdit' => $isSuperAdmin || $isAdmin,
                'canDelete' => $isSuperAdmin,
            ],
            'navigation' => $navigation,
            'alertsCount' => $user
                ? Alert::query()->where('is_delete', false)->count()
                : null,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * Restrict Operation Team navigation to Alerts and the combined Settings menu.
     * Home is rendered independently by the application layout.
     *
     * @param  array<int, array{screen_name: string, folder_name: string, icon: string, children: array<int, mixed>}>  $navigation
     * @return array<int, array{screen_name: string, folder_name: string, icon: string, children: array<int, mixed>}>
     */
    private function operationNavigation(array $navigation): array
    {
        $alerts = collect($navigation)->firstWhere('folder_name', 'alerts');
        $settings = collect($navigation)->firstWhere('folder_name', 'settings');
        $subSettings = collect($navigation)->firstWhere('folder_name', 'sub-settings');

        if ($settings !== null) {
            $settings['screen_name'] = 'All Settings';
            $settings['children'] = [
                ...$settings['children'],
                ...($subSettings['children'] ?? []),
            ];
        }

        return array_values(array_filter([$alerts, $settings]));
    }

    /**
     * Restrict Service Engineer navigation to its permitted settings and project setup.
     * Home is rendered independently by the application layout.
     *
     * @param  array<int, array{screen_name: string, folder_name: string, icon: string, children: array<int, mixed>}>  $navigation
     * @return array<int, array{screen_name: string, folder_name: string, icon: string, children: array<int, mixed>}>
     */
    private function serviceEngineerNavigation(array $navigation): array
    {
        $allowedSettings = [
            'states',
            'districts',
            'cities',
            'zones',
            'divisions',
            'stations',
            'departments',
            'units',
            'schedule-names',
            'schedule-types',
        ];

        $alerts = collect($navigation)->firstWhere('folder_name', 'alerts');
        $settings = collect($navigation)->firstWhere('folder_name', 'settings');
        $subSettings = collect($navigation)->firstWhere('folder_name', 'sub-settings');
        $projectSetup = collect($navigation)->firstWhere('folder_name', 'project-setup');

        $settingsChildren = [
            ...($settings['children'] ?? []),
            ...($subSettings['children'] ?? []),
        ];

        if ($settings !== null) {
            $settings['screen_name'] = 'Settings';
            $settings['children'] = array_values(array_filter(
                $settingsChildren,
                fn (array $screen): bool => in_array($screen['folder_name'], $allowedSettings, true),
            ));
        }

        return array_values(array_filter([
            $alerts,
            $settings !== null && $settings['children'] !== [] ? $settings : null,
            $projectSetup,
        ]));
    }
}
