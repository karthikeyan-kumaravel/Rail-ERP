<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PreventAdminDelete
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // Only apply when an authenticated user exists and the HTTP method
        // is DELETE (resource destroy routes). Super Admins are allowed.
        if ($user && $request->method() === 'DELETE') {
            $userTypeName = $user->userType?->name ?? null;

            if (strtolower((string) $userTypeName) === 'admin') {
                abort(403, 'You are not allowed to delete resources.');
            }
        }

        return $next($request);
    }
}
