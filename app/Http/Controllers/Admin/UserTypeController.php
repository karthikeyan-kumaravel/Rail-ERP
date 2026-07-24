<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserTypeRequest;
use App\Http\Requests\Admin\UpdateUserTypeRequest;
use App\Models\UserType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserTypeController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', 'name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['name', 'created_at'], true)) {
            $sort = 'name';
        }

        $query = UserType::query()
            ->withCount('users')
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $userTypes = $this->paginateQuery($query, $perPage);

        $userTypes->through(fn (UserType $userType) => [
            'unique_id' => $userType->unique_id,
            'name' => $userType->name,
            'active_status' => $userType->active_status,
            'users_count' => $userType->users_count,
            'created_at' => $userType->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/user-types/index', [
            'userTypes' => $userTypes,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(): Response
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to create records.');
        }

        return Inertia::render('admin/user-types/create');
    }

    public function store(StoreUserTypeRequest $request): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to create records.');
        }

        UserType::query()->create($request->validated());

        return redirect()->route('admin.user-types.index')->with('success', 'User type created successfully.');
    }

    public function show(UserType $userType): Response
    {
        return Inertia::render('admin/user-types/show', [
            'userType' => [
                'unique_id' => $userType->unique_id,
                'name' => $userType->name,
                'active_status' => $userType->active_status,
                'users_count' => $userType->users()->count(),
                'created_at' => $userType->created_at?->format('d M Y'),
            ],
        ]);
    }

    public function edit(UserType $userType): Response
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to edit records.');
        }

        return Inertia::render('admin/user-types/edit', [
            'userType' => $userType->only(['unique_id', 'name', 'active_status']),
        ]);
    }

    public function update(UpdateUserTypeRequest $request, UserType $userType): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to update records.');
        }

        $userType->update($request->validated());

        return redirect()->route('admin.user-types.index')->with('success', 'User type updated successfully.');
    }

    public function destroy(UserType $userType): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        if ($userType->users()->exists()) {
            return redirect()
                ->route('admin.user-types.index')
                ->with('success', 'User type cannot be deleted because users are assigned to it.');
        }

        // $userType->delete();
        $userType->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.user-types.index')->with('success', 'User type deleted successfully.');
    }
}
