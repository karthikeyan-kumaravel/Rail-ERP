<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStationRequest;
use App\Http\Requests\Admin\UpdateStationRequest;
use App\Models\City;
use App\Models\District;
use App\Models\Division;
use App\Models\State;
use App\Models\Station;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StationController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', 'station_name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['station_code', 'station_name', 'created_at'], true)) {
            $sort = 'station_name';
        }

        $query = Station::query()
            ->with(['zone:id,name', 'division:id,name', 'state:id,name', 'district:id,name', 'city:id,name'])
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('station_name', 'like', "%{$search}%")
                    ->orWhere('station_code', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $stations = $this->paginateQuery($query, $perPage);

        $stations->through(fn (Station $station) => [
            'unique_id' => $station->unique_id,
            'station_code' => $station->station_code,
            'station_name' => $station->station_name,
            'zone_id' => $station->zone_id,
            'zone' => $station->zone?->name,
            'division_id' => $station->division_id,
            'division' => $station->division?->name,
            'state' => $station->state?->name,
            'district' => $station->district?->name,
            'city' => $station->city?->name,
            'address' => $station->address,
            'latitude' => $station->latitude,
            'longitude' => $station->longitude,
            'active_status' => $station->active_status,
            'created_at' => $station->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/stations/index', [
            'stations' => $stations,
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
        return Inertia::render('admin/stations/create', [
            'zones' => $this->zoneOptions(),
            'divisions' => $this->divisionOptions(),
            'states' => $this->stateOptions(),
            'districts' => $this->districtOptions(),
            'cities' => $this->cityOptions(),
        ]);
    }

    public function store(StoreStationRequest $request): RedirectResponse
    {
        Station::query()->create($request->validated());

        return redirect()->route('admin.stations.index')->with('success', 'Station created successfully.');
    }

    public function edit(Station $station): Response
    {
        return Inertia::render('admin/stations/edit', [
            'station' => $station->only([
                'unique_id',
                'zone_id',
                'division_id',
                'station_code',
                'station_name',
                'state_id',
                'district_id',
                'city_id',
                'address',
                'latitude',
                'longitude',
                'active_status',
            ]),
            'zones' => $this->zoneOptions(),
            'divisions' => $this->divisionOptions(),
            'states' => $this->stateOptions(),
            'districts' => $this->districtOptions(),
            'cities' => $this->cityOptions(),
        ]);
    }

    public function update(UpdateStationRequest $request, Station $station): RedirectResponse
    {
        $station->update($request->validated());

        return redirect()->route('admin.stations.index')->with('success', 'Station updated successfully.');
    }

    public function destroy(Station $station): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        $station->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.stations.index')->with('success', 'Station deleted successfully.');
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

    /**
     * @return array<int, array{id: int, name: string, zone_id: int}>
     */
    private function divisionOptions(): array
    {
        return Division::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name', 'zone_id'])
            ->toArray();
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

    /**
     * @return array<int, array{id: int, name: string, district_id: int}>
     */
    private function cityOptions(): array
    {
        return City::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name', 'district_id'])
            ->toArray();
    }
}
