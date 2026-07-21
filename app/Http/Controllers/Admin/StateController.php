<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStateRequest;
use App\Http\Requests\Admin\UpdateStateRequest;
use App\Models\State;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StateController extends Controller
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

        $query = State::query()
            ->withCount('districts')
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $states = $this->paginateQuery($query, $perPage);

        $states->through(fn (State $state) => [
            'unique_id' => $state->unique_id,
            'name' => $state->name,
            'code' => $state->code,
            'active_status' => $state->active_status,
            'districts_count' => $state->districts_count,
            'created_at' => $state->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/states/index', [
            'states' => $states,
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
        return Inertia::render('admin/states/create');
    }

    public function store(StoreStateRequest $request): RedirectResponse
    {
        State::query()->create($request->validated());

        return redirect()->route('admin.states.index')->with('success', 'State created successfully.');
    }

    public function edit(State $state): Response
    {
        return Inertia::render('admin/states/edit', [
            'state' => $state->only(['unique_id', 'name', 'code', 'active_status']),
        ]);
    }

    public function update(UpdateStateRequest $request, State $state): RedirectResponse
    {
        $state->update($request->validated());

        return redirect()->route('admin.states.index')->with('success', 'State updated successfully.');
    }

    public function destroy(State $state): RedirectResponse
    {
        if ($state->districts()->exists()) {
            return redirect()
                ->route('admin.states.index')
                ->with('success', 'State cannot be deleted because districts are assigned to it.');
        }

        $state->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.states.index')->with('success', 'State deleted successfully.');
    }
}
