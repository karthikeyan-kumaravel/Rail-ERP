<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreScheduleTypeRequest;
use App\Http\Requests\Admin\UpdateScheduleTypeRequest;
use App\Models\ScheduleName;
use App\Models\ScheduleType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleTypeController extends Controller
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

        $query = ScheduleType::query()
            ->with('scheduleName:id,name')
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $scheduleTypes = $this->paginateQuery($query, $perPage);

        $scheduleTypes->through(fn (ScheduleType $scheduleType) => [
            'unique_id' => $scheduleType->unique_id,
            'name' => $scheduleType->name,
            'short_name' => $scheduleType->short_name,
            'schedule_name' => $scheduleType->scheduleName?->name,
            'schedule_name_id' => $scheduleType->schedule_name_id,
            'active_status' => $scheduleType->active_status,
            'created_at' => $scheduleType->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/schedule-types/index', [
            'scheduleTypes' => $scheduleTypes,
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
        return Inertia::render('admin/schedule-types/create', [
            'scheduleNames' => $this->scheduleNameOptions(),
        ]);
    }

    public function store(StoreScheduleTypeRequest $request): RedirectResponse
    {
        ScheduleType::query()->create($request->validated());

        return redirect()->route('admin.schedule-types.index')->with('success', 'Schedule Type created successfully.');
    }

    public function edit(ScheduleType $scheduleType): Response
    {
        return Inertia::render('admin/schedule-types/edit', [
            'scheduleType' => $scheduleType->only([
                'unique_id',
                'schedule_name_id',
                'name',
                'short_name',
                'active_status',
            ]),
            'scheduleNames' => $this->scheduleNameOptions(),
        ]);
    }

    public function update(UpdateScheduleTypeRequest $request, ScheduleType $scheduleType): RedirectResponse
    {
        $scheduleType->update($request->validated());

        return redirect()->route('admin.schedule-types.index')->with('success', 'Schedule Type updated successfully.');
    }

    public function destroy(ScheduleType $scheduleType): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        $scheduleType->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.schedule-types.index')->with('success', 'Schedule Type deleted successfully.');
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function scheduleNameOptions(): array
    {
        return ScheduleName::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }
}
