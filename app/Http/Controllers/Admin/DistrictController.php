<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDistrictRequest;
use App\Http\Requests\Admin\UpdateDistrictRequest;
use App\Models\District;
use App\Models\State;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DistrictController extends Controller
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

        $query = District::query()
            ->with('state:id,name')
            ->withCount('cities')
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $districts = $this->paginateQuery($query, $perPage);

        $districts->through(fn (District $district) => [
            'unique_id' => $district->unique_id,
            'name' => $district->name,
            'code' => $district->code,
            'state' => $district->state?->name,
            'state_id' => $district->state_id,
            'active_status' => $district->active_status,
            'cities_count' => $district->cities_count,
            'created_at' => $district->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/districts/index', [
            'districts' => $districts,
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
        return Inertia::render('admin/districts/create', [
            'states' => $this->stateOptions(),
        ]);
    }

    public function store(StoreDistrictRequest $request): RedirectResponse
    {
        District::query()->create($request->validated());

        return redirect()->route('admin.districts.index')->with('success', 'District created successfully.');
    }

    public function edit(District $district): Response
    {
        return Inertia::render('admin/districts/edit', [
            'district' => $district->only([
                'unique_id',
                'state_id',
                'name',
                'code',
                'active_status',
            ]),
            'states' => $this->stateOptions(),
        ]);
    }

    public function update(UpdateDistrictRequest $request, District $district): RedirectResponse
    {
        $district->update($request->validated());

        return redirect()->route('admin.districts.index')->with('success', 'District updated successfully.');
    }

    public function destroy(District $district): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        if ($district->cities()->exists()) {
            return redirect()
                ->route('admin.districts.index')
                ->with('success', 'District cannot be deleted because cities are assigned to it.');
        }

        $district->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.districts.index')->with('success', 'District deleted successfully.');
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function stateOptions(): array
    {
        return State::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }
}
