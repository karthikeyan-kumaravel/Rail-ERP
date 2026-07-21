<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserScreenRequest;
use App\Http\Requests\Admin\UpdateUserScreenRequest;
use App\Models\UserScreen;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserScreenController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', 'order_no')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['screen_name', 'order_no', 'created_at'], true)) {
            $sort = 'order_no';
        }

        $query = UserScreen::query()
            ->with('mainScreen:id,screen_name')
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('screen_name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $userScreens = $this->paginateQuery($query, $perPage);

        $userScreens->through(fn (UserScreen $userScreen) => [
            'unique_id' => $userScreen->unique_id,
            'screen_name' => $userScreen->screen_name,
            'main_screen' => $userScreen->mainScreen?->screen_name,
            'folder_name' => $userScreen->folder_name,
            'order_no' => $userScreen->order_no,
            'icon' => $userScreen->icon,
            'status' => $userScreen->status,
            'created_at' => $userScreen->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/user-screens/index', [
            'userScreens' => $userScreens,
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
        return Inertia::render('admin/user-screens/create', [
            'mainScreens' => $this->mainScreenOptions(),
        ]);
    }

    public function store(StoreUserScreenRequest $request): RedirectResponse
    {
        UserScreen::query()->create($request->validated());

        return redirect()->route('admin.user-screens.index')->with('success', 'User screen created successfully.');
    }

    public function edit(UserScreen $userScreen): Response
    {
        return Inertia::render('admin/user-screens/edit', [
            'userScreen' => $userScreen->only([
                'unique_id',
                'main_screen_id',
                'screen_name',
                'folder_name',
                'order_no',
                'icon',
                'description',
                'status',
                'can_add',
                'can_update',
                'can_list',
                'can_delete',
                'can_view',
                'can_cancel',
            ]),
            'mainScreens' => $this->mainScreenOptions($userScreen->id),
        ]);
    }

    public function update(UpdateUserScreenRequest $request, UserScreen $userScreen): RedirectResponse
    {
        $userScreen->update($request->validated());

        return redirect()->route('admin.user-screens.index')->with('success', 'User screen updated successfully.');
    }

    public function destroy(UserScreen $userScreen): RedirectResponse
    {
        if ($userScreen->subScreens()->exists()) {
            return redirect()
                ->route('admin.user-screens.index')
                ->with('success', 'User screen cannot be deleted because it has sub screens assigned to it.');
        }

        $userScreen->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.user-screens.index')->with('success', 'User screen deleted successfully.');
    }

    /**
     * @return array<int, array{id: int, screen_name: string}>
     */
    private function mainScreenOptions(?int $excludingId = null): array
    {
        return UserScreen::query()
            ->where('is_delete', false)
            ->whereNull('main_screen_id')
            ->when($excludingId, fn ($query) => $query->whereKeyNot($excludingId))
            ->orderBy('screen_name')
            ->get(['id', 'screen_name'])
            ->toArray();
    }
}
