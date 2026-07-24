<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEngineerRequest;
use App\Http\Requests\Admin\UpdateEngineerRequest;
use App\Models\City;
use App\Models\Engineer;
use App\Models\EngineerType;
use App\Models\State;
use App\Support\EngineerFormSteps;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EngineerController extends Controller
{
    use HasPaginatedIndex;

    /**
     * Lightweight JSON search used by the searchable Engineer picker on the
     * LOA Project Team tab — matches on employee code and full name, capped
     * to a small result set since it's a typeahead, not a full listing.
     */
    public function search(Request $request): JsonResponse
    {
        $search = $request->string('search')->trim()->toString();

        $engineers = Engineer::query()
            ->with('engineerType:id,name')
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('full_name', 'like', "%{$search}%")
                        ->orWhere('employee_code', 'like', "%{$search}%");
                });
            })
            ->orderBy('full_name')
            ->limit(20)
            ->get(['id', 'employee_code', 'full_name', 'engineer_type_id']);

        return response()->json([
            'engineers' => $engineers->map(fn (Engineer $engineer) => [
                'id' => $engineer->id,
                'employee_code' => $engineer->employee_code,
                'full_name' => $engineer->full_name,
                'engineer_type_id' => $engineer->engineer_type_id,
                'engineer_type' => $engineer->engineerType?->name,
            ])->values(),
        ]);
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', 'full_name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['full_name', 'employee_code', 'date_of_joining', 'created_at'], true)) {
            $sort = 'full_name';
        }

        $query = Engineer::query()
            ->with(['engineerType:id,name'])
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('full_name', 'like', "%{$search}%")
                    ->orWhere('employee_code', 'like', "%{$search}%")
                    ->orWhere('mobile_number', 'like', "%{$search}%")
                    ->orWhere('official_email', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $engineers = $this->paginateQuery($query, $perPage);

        $engineers->through(fn (Engineer $engineer) => [
            'unique_id' => $engineer->unique_id,
            'employee_code' => $engineer->employee_code,
            'full_name' => $engineer->full_name,
            'mobile_number' => $engineer->mobile_number,
            'official_email' => $engineer->official_email,
            'engineer_type' => $engineer->engineerType?->name,
            'employee_status' => $engineer->employee_status,
            'date_of_joining' => $engineer->date_of_joining?->format('d M Y'),
            'created_at' => $engineer->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/engineers/index', [
            'engineers' => $engineers,
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
        return Inertia::render('admin/engineers/create', [
            'engineerTypes' => $this->engineerTypeOptions(),
            'states' => $this->stateOptions(),
            'cities' => $this->cityOptions(),
        ]);
    }

    public function store(StoreEngineerRequest $request): RedirectResponse
    {
        $engineer = $this->createWithGeneratedCode($request->validated());

        if (! $request->boolean('finish', true)) {
            return redirect($this->resumeUrl($engineer, $request->string('current_step')->toString()))
                ->with('success', 'Progress saved.');
        }

        return redirect()->route('admin.engineers.index')->with('success', 'Engineer created successfully.');
    }

    public function edit(Request $request, Engineer $engineer): Response
    {
        $resumeTab = $request->query('tab');

        return Inertia::render('admin/engineers/edit', [
            'resumeTab' => in_array($resumeTab, EngineerFormSteps::TAB_ORDER, true) ? $resumeTab : null,
            'engineer' => $engineer->only([
                'unique_id',
                'employee_code',
                'full_name',
                'gender',
                'date_of_birth',
                'blood_group',
                'nationality',
                'marital_status',
                'mobile_number',
                'alternate_mobile_number',
                'official_email',
                'personal_email',
                'current_address',
                'permanent_address',
                'city_id',
                'state_id',
                'postal_code',
                'aadhaar_number',
                'pan_number',
                'date_of_joining',
                'employee_status',
                'engineer_type_id',
                'bank_name',
                'branch_name',
                'account_number',
                'ifsc_code',
                'pf_account_number',
                'esi_account_number',
                'languages_known',
            ]),
            'engineerTypes' => $this->engineerTypeOptions(),
            'states' => $this->stateOptions(),
            'cities' => $this->cityOptions(),
        ]);
    }

    public function update(UpdateEngineerRequest $request, Engineer $engineer): RedirectResponse
    {
        $engineer->update($request->validated());

        if (! $request->boolean('finish', true)) {
            return redirect($this->resumeUrl($engineer, $request->string('current_step')->toString()))
                ->with('success', 'Progress saved.');
        }

        return redirect()->route('admin.engineers.index')->with('success', 'Engineer updated successfully.');
    }

    public function destroy(Engineer $engineer): RedirectResponse
    {
        if (strtolower((string) (auth()->user()->userType?->name ?? '')) !== 'super admin') {
            abort(403, 'You are not authorized to delete records.');
        }

        $engineer->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.engineers.index')->with('success', 'Engineer deleted successfully.');
    }

    /**
     * The edit URL for the tab that follows $currentStep in the
     * "Save & Continue" wizard, or the plain edit URL once the last tab has
     * been reached.
     */
    private function resumeUrl(Engineer $engineer, string $currentStep): string
    {
        $url = route('admin.engineers.edit', $engineer);
        $nextTab = EngineerFormSteps::nextTab($currentStep);

        return $nextTab !== null ? "{$url}?tab={$nextTab}" : $url;
    }

    /**
     * Create an engineer with a freshly generated employee code, retrying a
     * handful of times in the rare case another request claims the same code
     * between the max() lookup and the insert.
     *
     * @param  array<string, mixed>  $attributes
     */
    private function createWithGeneratedCode(array $attributes): Engineer
    {
        $attempts = 0;

        while (true) {
            $attempts++;

            try {
                return Engineer::query()->create([
                    ...$attributes,
                    'employee_code' => $this->generateEmployeeCode(),
                ]);
            } catch (QueryException $exception) {
                if ($attempts >= 3 || ! str_contains($exception->getMessage(), 'employee_code')) {
                    throw $exception;
                }
            }
        }
    }

    private function generateEmployeeCode(): string
    {
        $next = ((int) Engineer::query()->max('id')) + 1;

        return 'ENG-'.str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function engineerTypeOptions(): array
    {
        return EngineerType::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name'])
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
    private function cityOptions(): array
    {
        return City::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name', 'state_id'])
            ->toArray();
    }
}
