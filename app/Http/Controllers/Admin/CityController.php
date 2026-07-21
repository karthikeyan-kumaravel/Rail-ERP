<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCityRequest;
use App\Http\Requests\Admin\UpdateCityRequest;
use App\Models\City;
use App\Models\District;
use App\Models\State;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CityController extends Controller
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

        $query = City::query()
            ->with(['district:id,name,state_id', 'district.state:id,name'])
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $cities = $this->paginateQuery($query, $perPage);

        $cities->through(fn (City $city) => [
            'unique_id' => $city->unique_id,
            'name' => $city->name,
            'city_code' => $city->city_code,
            'pincode' => $city->pincode,
            'district_id' => $city->district_id,
            'district' => $city->district?->name,
            'state' => $city->district?->state?->name,
            'active_status' => $city->active_status,
            'created_at' => $city->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/cities/index', [
            'cities' => $cities,
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
        return Inertia::render('admin/cities/create', [
            'states' => $this->stateOptions(),
            'districts' => $this->districtOptions(),
        ]);
    }

    public function store(StoreCityRequest $request): RedirectResponse
    {
        City::query()->create($request->validated());

        return redirect()->route('admin.cities.index')->with('success', 'City created successfully.');
    }

    public function edit(City $city): Response
    {
        return Inertia::render('admin/cities/edit', [
            'city' => $city->only([
                'unique_id',
                'state_id',
                'district_id',
                'name',
                'city_code',
                'pincode',
                'active_status',
            ]),
            'states' => $this->stateOptions(),
            'districts' => $this->districtOptions(),
        ]);
    }

    public function update(UpdateCityRequest $request, City $city): RedirectResponse
    {
        $city->update($request->validated());

        return redirect()->route('admin.cities.index')->with('success', 'City updated successfully.');
    }

    public function destroy(City $city): RedirectResponse
    {
        $city->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.cities.index')->with('success', 'City deleted successfully.');
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

    /**
     * @return array<int, array{id: int, name: string, state_id: int}>
     */
    private function districtOptions(): array
    {
        return District::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name', 'state_id'])
            ->toArray();
    }
}
