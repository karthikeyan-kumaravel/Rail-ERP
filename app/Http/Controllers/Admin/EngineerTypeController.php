<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEngineerTypeRequest;
use App\Http\Requests\Admin\UpdateEngineerTypeRequest;
use App\Models\EngineerType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EngineerTypeController extends Controller
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

        $query = EngineerType::query()
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $engineerTypes = $this->paginateQuery($query, $perPage);

        $engineerTypes->through(fn (EngineerType $engineerType) => [
            'unique_id' => $engineerType->unique_id,
            'name' => $engineerType->name,
            'active_status' => $engineerType->active_status,
            'created_at' => $engineerType->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/engineer-types/index', [
            'engineerTypes' => $engineerTypes,
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
        return Inertia::render('admin/engineer-types/create');
    }

    public function store(StoreEngineerTypeRequest $request): RedirectResponse
    {
        EngineerType::query()->create($request->validated());

        return redirect()->route('admin.engineer-types.index')->with('success', 'Engineer Type created successfully.');
    }

    public function edit(EngineerType $engineerType): Response
    {
        return Inertia::render('admin/engineer-types/edit', [
            'engineerType' => $engineerType->only(['unique_id', 'name', 'active_status']),
        ]);
    }

    public function update(UpdateEngineerTypeRequest $request, EngineerType $engineerType): RedirectResponse
    {
        $engineerType->update($request->validated());

        return redirect()->route('admin.engineer-types.index')->with('success', 'Engineer Type updated successfully.');
    }

    public function destroy(EngineerType $engineerType): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        $engineerType->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.engineer-types.index')->with('success', 'Engineer Type deleted successfully.');
    }
}
