<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreActivityRequest;
use App\Http\Requests\Admin\UpdateActivityRequest;
use App\Models\Activity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
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

        $query = Activity::query()
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $activities = $this->paginateQuery($query, $perPage);

        $activities->through(fn (Activity $activity) => [
            'unique_id' => $activity->unique_id,
            'name' => $activity->name,
            'active_status' => $activity->active_status,
            'created_at' => $activity->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/activities/index', [
            'activities' => $activities,
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
        return Inertia::render('admin/activities/create');
    }

    public function store(StoreActivityRequest $request): RedirectResponse
    {
        Activity::query()->create($request->validated());

        return redirect()->route('admin.activities.index')->with('success', 'Activity created successfully.');
    }

    public function edit(Activity $activity): Response
    {
        return Inertia::render('admin/activities/edit', [
            'activity' => $activity->only(['unique_id', 'name', 'active_status']),
        ]);
    }

    public function update(UpdateActivityRequest $request, Activity $activity): RedirectResponse
    {
        $activity->update($request->validated());

        return redirect()->route('admin.activities.index')->with('success', 'Activity updated successfully.');
    }

    public function destroy(Activity $activity): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        $activity->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.activities.index')->with('success', 'Activity deleted successfully.');
    }
}
