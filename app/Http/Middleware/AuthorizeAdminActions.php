<?php

namespace App\Http\Middleware;

use App\Models\UserScreen;
use App\Models\UserTypePermission;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AuthorizeAdminActions
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            abort(401);
        }

        $routeName = (string) ($request->route()?->getName() ?? '');
        if ($routeName === '' || ! Str::startsWith($routeName, 'admin.')) {
            return $next($request);
        }

        $role = Str::slug((string) ($user->userType?->name ?? ''), '');

        if ($role === 'superadmin') {
            return $next($request);
        }

        if ($role === 'admin') {
            if (in_array($request->method(), ['PUT', 'PATCH', 'DELETE'], true)) {
                abort(403, 'Only Super Admin can update or delete records.');
            }

            if (Str::endsWith($routeName, '.edit')) {
                abort(403, 'Only Super Admin can edit records.');
            }

            return $next($request);
        }

        if ($role === 'accountsteam') {
            if (! $request->isMethod('GET')) {
                abort(403, 'Unauthorized');
            }

            $routeSegments = explode('.', $routeName);
            $module = trim((string) ($routeSegments[1] ?? ''));
            if ($module === '') {
                abort(403, 'Unauthorized');
            }

            $allowed = in_array($module, [
                'alerts',
                'settings',
                'customers',
                'vendors',
                'banks',
                'engineers',
                'engineer-types',
            ], true);

            if (! $allowed) {
                abort(403, 'Unauthorized');
            }

            return $next($request);
        }

        if ($role === 'operationteam') {
            if (! $request->isMethod('GET')) {
                abort(403, 'Unauthorized');
            }

            $routeSegments = explode('.', $routeName);
            $module = trim((string) ($routeSegments[1] ?? ''));
            if ($module === '') {
                abort(403, 'Unauthorized');
            }

            $allowed = in_array($module, [
                'alerts',
                'settings',
                'states',
                'districts',
                'cities',
                'zones',
                'divisions',
                'stations',
                'customers',
                'vendors',
                'banks',
                'activities',
                'engineer-types',
                'units',
                'departments',
                'projects',
                'schedule-names',
                'schedule-types',
                'engineers',
            ], true);

            if (! $allowed) {
                abort(403, 'Unauthorized');
            }

            return $next($request);
        }

        if ($role === 'serviceengineer') {
            if (! $request->isMethod('GET')) {
                abort(403, 'Unauthorized');
            }

            $routeSegments = explode('.', $routeName);
            $module = trim((string) ($routeSegments[1] ?? ''));
            if ($module === '') {
                abort(403, 'Unauthorized');
            }

            $allowed = in_array($module, [
                'alerts',
                'settings',
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
                'loas',
                'purchase-orders',
            ], true);

            if (! $allowed) {
                abort(403, 'Unauthorized');
            }

            return $next($request);
        }

        if ($request->isMethod('GET')) {
            return $next($request);
        }

        $routeSegments = explode('.', $routeName);
        $module = trim((string) ($routeSegments[1] ?? ''));
        if ($module === '') {
            abort(403, 'Unauthorized');
        }

        $screen = UserScreen::query()
            ->where('folder_name', $module)
            ->where('is_delete', false)
            ->first(['id']);

        if ($screen === null) {
            abort(403, 'Unauthorized');
        }

        $permission = UserTypePermission::query()
            ->where('user_type_id', $user->user_type_id)
            ->where('user_screen_id', $screen->id)
            ->where('is_delete', false)
            ->first();

        if ($permission === null) {
            abort(403, 'Unauthorized');
        }

        $allowed = match (true) {
            Str::endsWith($routeName, '.create') => (bool) $permission->can_add,
            Str::endsWith($routeName, '.edit') => (bool) $permission->can_update,
            $request->isMethod('POST') => (bool) $permission->can_add,
            $request->isMethod(['PUT', 'PATCH']) => (bool) $permission->can_update,
            $request->isMethod('DELETE') => (bool) $permission->can_delete,
            default => false,
        };

        if (! $allowed) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
