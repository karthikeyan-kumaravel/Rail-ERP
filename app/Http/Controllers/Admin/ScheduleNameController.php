<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreScheduleNameRequest;
use App\Http\Requests\Admin\UpdateScheduleNameRequest;
use App\Models\ScheduleName;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleNameController extends Controller
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

        $query = ScheduleName::query()
            ->withCount('scheduleTypes')
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $scheduleNames = $this->paginateQuery($query, $perPage);

        $scheduleNames->through(fn (ScheduleName $scheduleName) => [
            'unique_id' => $scheduleName->unique_id,
            'name' => $scheduleName->name,
            'active_status' => $scheduleName->active_status,
            'schedule_types_count' => $scheduleName->schedule_types_count,
            'created_at' => $scheduleName->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/schedule-names/index', [
            'scheduleNames' => $scheduleNames,
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
        return Inertia::render('admin/schedule-names/create');
    }

    public function store(StoreScheduleNameRequest $request): RedirectResponse
    {
        ScheduleName::query()->create($request->validated());

        return redirect()->route('admin.schedule-names.index')->with('success', 'Schedule Name created successfully.');
    }

    public function edit(ScheduleName $scheduleName): Response
    {
        return Inertia::render('admin/schedule-names/edit', [
            'scheduleName' => $scheduleName->only(['unique_id', 'name', 'active_status']),
        ]);
    }

    public function update(UpdateScheduleNameRequest $request, ScheduleName $scheduleName): RedirectResponse
    {
        $scheduleName->update($request->validated());

        return redirect()->route('admin.schedule-names.index')->with('success', 'Schedule Name updated successfully.');
    }

    public function destroy(ScheduleName $scheduleName): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        if ($scheduleName->scheduleTypes()->exists()) {
            return redirect()
                ->route('admin.schedule-names.index')
                ->with('success', 'Schedule Name cannot be deleted because schedule types are assigned to it.');
        }

        $scheduleName->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.schedule-names.index')->with('success', 'Schedule Name deleted successfully.');
    }
}
