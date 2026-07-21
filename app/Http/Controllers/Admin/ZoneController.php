<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreZoneRequest;
use App\Http\Requests\Admin\UpdateZoneRequest;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZoneController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', 'name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['name', 'code', 'created_at'], true)) {
            $sort = 'name';
        }

        $query = Zone::query()
            ->withCount('divisions')
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $zones = $this->paginateQuery($query, $perPage);

        $zones->through(fn (Zone $zone) => [
            'unique_id' => $zone->unique_id,
            'name' => $zone->name,
            'code' => $zone->code,
            'active_status' => $zone->active_status,
            'divisions_count' => $zone->divisions_count,
            'created_at' => $zone->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/zones/index', [
            'zones' => $zones,
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
        return Inertia::render('admin/zones/create');
    }

    public function store(StoreZoneRequest $request): RedirectResponse
    {
        Zone::query()->create($request->validated());

        return redirect()->route('admin.zones.index')->with('success', 'Zone created successfully.');
    }

    public function edit(Zone $zone): Response
    {
        return Inertia::render('admin/zones/edit', [
            'zone' => $zone->only(['unique_id', 'name', 'code', 'active_status']),
        ]);
    }

    public function update(UpdateZoneRequest $request, Zone $zone): RedirectResponse
    {
        $zone->update($request->validated());

        return redirect()->route('admin.zones.index')->with('success', 'Zone updated successfully.');
    }

    public function destroy(Zone $zone): RedirectResponse
    {
        if ($zone->divisions()->exists()) {
            return redirect()
                ->route('admin.zones.index')
                ->with('success', 'Zone cannot be deleted because divisions are assigned to it.');
        }

        $zone->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.zones.index')->with('success', 'Zone deleted successfully.');
    }
}
