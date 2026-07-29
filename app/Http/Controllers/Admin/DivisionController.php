<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDivisionRequest;
use App\Http\Requests\Admin\UpdateDivisionRequest;
use App\Models\Division;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DivisionController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $divisionName = $request->string('division_name')->trim()->toString();
        $zoneId = $request->integer('zone_id');
        $sort = $request->string('sort', 'name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['name', 'created_at'], true)) {
            $sort = 'name';
        }

        $query = Division::query()
            ->with('zone:id,name')
            ->withCount('stations')
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($divisionName !== '', fn ($query) => $query->where('name', $divisionName))
            ->when($zoneId !== 0, fn ($query) => $query->where('zone_id', $zoneId))
            ->orderBy($sort, $direction);

        $divisions = $this->paginateQuery($query, $perPage);

        $divisions->through(fn (Division $division) => [
            'unique_id' => $division->unique_id,
            'name' => $division->name,
            'code' => $division->code,
            'zone_id' => $division->zone_id,
            'zone' => $division->zone?->name,
            'active_status' => $division->active_status,
            'stations_count' => $division->stations_count,
            'created_at' => $division->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/divisions/index', [
            'divisions' => $divisions,
            'divisionNames' => Division::query()->where('is_delete', false)->distinct()->orderBy('name')->pluck('name'),
            'zones' => $this->zoneOptions(),
            'filters' => [
                'search' => $search,
                'division_name' => $divisionName,
                'zone_id' => $zoneId,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/divisions/create', [
            'zones' => $this->zoneOptions(),
        ]);
    }

    public function store(StoreDivisionRequest $request): RedirectResponse
    {
        Division::query()->create($request->validated());

        return redirect()->route('admin.divisions.index')->with('success', 'Division created successfully.');
    }

    public function show(Division $division): Response
    {
        $division->load('zone:id,name')->loadCount('stations');

        return Inertia::render('admin/divisions/show', [
            'division' => [
                'unique_id' => $division->unique_id,
                'name' => $division->name,
                'code' => $division->code,
                'zone' => $division->zone?->name,
                'active_status' => $division->active_status,
                'stations_count' => $division->stations_count,
                'created_at' => $division->created_at?->format('d M Y'),
            ],
        ]);
    }

    public function edit(Division $division): Response
    {
        return Inertia::render('admin/divisions/edit', [
            'division' => $division->only([
                'unique_id',
                'zone_id',
                'name',
                'code',
                'active_status',
            ]),
            'zones' => $this->zoneOptions(),
        ]);
    }

    public function update(UpdateDivisionRequest $request, Division $division): RedirectResponse
    {
        $division->update($request->validated());

        return redirect()->route('admin.divisions.index')->with('success', 'Division updated successfully.');
    }

    public function destroy(Division $division): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        if ($division->stations()->exists()) {
            return redirect()
                ->route('admin.divisions.index')
                ->with('success', 'Division cannot be deleted because stations are assigned to it.');
        }

        $division->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.divisions.index')->with('success', 'Division deleted successfully.');
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function zoneOptions(): array
    {
        return Zone::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }
}
