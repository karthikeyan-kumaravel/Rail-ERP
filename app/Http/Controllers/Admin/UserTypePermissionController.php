<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserTypePermissionRequest;
use App\Models\UserScreen;
use App\Models\UserType;
use App\Models\UserTypePermission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserTypePermissionController extends Controller
{
    public function index(): Response
    {
        $userTypes = UserType::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['unique_id', 'name', 'active_status']);

        return Inertia::render('admin/user-type-permissions/index', [
            'userTypes' => $userTypes,
        ]);
    }

    public function edit(UserType $userType): Response
    {
        $permissions = UserTypePermission::query()
            ->where('user_type_id', $userType->id)
            ->where('is_delete', false)
            ->get(['user_screen_id', 'can_view', 'can_add', 'can_update', 'can_delete'])
            ->keyBy('user_screen_id');

        $screens = UserScreen::query()
            ->with('mainScreen:id,screen_name')
            ->where('is_delete', false)
            ->orderBy('order_no')
            ->orderBy('screen_name')
            ->get(['id', 'main_screen_id', 'screen_name'])
            ->map(fn (UserScreen $screen) => [
                'id' => $screen->id,
                'screen_name' => $screen->screen_name,
                'group_name' => $screen->mainScreen?->screen_name,
                'can_view' => (bool) $permissions->get($screen->id)?->can_view,
                'can_add' => (bool) $permissions->get($screen->id)?->can_add,
                'can_update' => (bool) $permissions->get($screen->id)?->can_update,
                'can_delete' => (bool) $permissions->get($screen->id)?->can_delete,
            ])
            ->values();

        return Inertia::render('admin/user-type-permissions/edit', [
            'userType' => $userType->only(['unique_id', 'name']),
            'screens' => $screens,
        ]);
    }

    public function update(UpdateUserTypePermissionRequest $request, UserType $userType): RedirectResponse
    {
        /** @var array<int, array{user_screen_id: int, can_view?: bool, can_add?: bool, can_update?: bool, can_delete?: bool}> $permissions */
        $permissions = $request->validated('permissions');

        DB::transaction(function () use ($permissions, $userType): void {
            foreach ($permissions as $permission) {
                UserTypePermission::query()->updateOrCreate(
                    [
                        'user_type_id' => $userType->id,
                        'user_screen_id' => $permission['user_screen_id'],
                    ],
                    [
                        'can_view' => $permission['can_view'] ?? false,
                        'can_add' => $permission['can_add'] ?? false,
                        'can_update' => $permission['can_update'] ?? false,
                        'can_delete' => $permission['can_delete'] ?? false,
                    ],
                );
            }
        });

        return redirect()->route('admin.user-type-permissions.index')->with('success', 'Permissions updated successfully.');
    }
}
