<?php

namespace App\Http\Middleware;

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

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'role' => $user?->userType?->name,
                'isSuperAdmin' => $isSuperAdmin,
                'isAdmin' => $isAdmin,
                'canCreate' => $isSuperAdmin || $isAdmin,
                'canEdit' => $isSuperAdmin || $isAdmin,
                'canDelete' => $isSuperAdmin,
            ],
            'navigation' => $user ? UserScreen::navigationTree() : [],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
