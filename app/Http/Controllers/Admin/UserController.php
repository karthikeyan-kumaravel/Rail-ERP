<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $staffName = $request->string('staff_name')->trim()->toString();
        $userName = $request->string('user_name')->trim()->toString();
        $mobileNo = $request->string('mobile_no')->trim()->toString();
        $sort = $request->string('sort', 'name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['name', 'username', 'mobile_no'], true)) {
            $sort = 'name';
        }

        $query = User::query()
            ->with('userType')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('mobile_no', 'like', "%{$search}%")
                        ->orWhereHas('userType', function ($query) use ($search) {
                            $query->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($staffName !== '', fn ($query) => $query->where('name', $staffName))
            ->when($userName !== '', fn ($query) => $query->where('username', $userName))
            ->when($mobileNo !== '', fn ($query) => $query->where('mobile_no', 'like', "%{$mobileNo}%"))
            ->orderBy($sort, $direction);

        $users = $this->paginateQuery($query, $perPage);

        $users->through(fn (User $user) => [
            'unique_id' => $user->unique_id,
            'name' => $user->name,
            'username' => $user->username,
            'mobile_no' => $user->mobile_no,
            'user_type' => $user->userType?->name,
        ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'staffNames' => User::query()->distinct()->orderBy('name')->pluck('name'),
            'userNames' => User::query()->distinct()->orderBy('username')->pluck('username'),
            'filters' => [
                'search' => $search,
                'staff_name' => $staffName,
                'user_name' => $userName,
                'mobile_no' => $mobileNo,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->load('userType');

        return Inertia::render('admin/users/show', [
            'user' => [
                'unique_id' => $user->unique_id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'mobile_no' => $user->mobile_no,
                'user_type' => $user->userType?->name,
                'created' => $user->created?->format('d M Y'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'userTypes' => UserType::query()->where('is_delete', false)->orderBy('name')->get(['id', 'name']),
            'existingUsers' => User::query()->get(['id', 'name', 'username', 'mobile_no']),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        User::query()->create($validated);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user->only(['unique_id', 'name', 'username', 'email', 'mobile_no', 'user_type_id']),
            'userTypes' => UserType::query()->where('is_delete', false)->orderBy('name')->get(['id', 'name']),
            'existingUsers' => User::query()->get(['id', 'name', 'username', 'mobile_no']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()?->id === $user->id) {
            return redirect()
                ->route('admin.users.index')
                ->with('success', 'You cannot delete your own account.');
        }

        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
