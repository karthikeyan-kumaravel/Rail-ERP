<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProjectRequest;
use App\Http\Requests\Admin\UpdateProjectRequest;
use App\Models\Customer;
use App\Models\Division;
use App\Models\Loa;
use App\Models\Project;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    use HasPaginatedIndex;

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', 'name')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['name', 'contract_value', 'created_at'], true)) {
            $sort = 'name';
        }

        $query = Project::query()
            ->with(['customer:id,name', 'zone:id,name', 'division:id,name', 'loa:id,loa_number'])
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy($sort, $direction);

        $projects = $this->paginateQuery($query, $perPage);

        $projects->through(fn (Project $project) => [
            'unique_id' => $project->unique_id,
            'name' => $project->name,
            'customer' => $project->customer?->name,
            'customer_id' => $project->customer_id,
            'zone' => $project->zone?->name,
            'zone_id' => $project->zone_id,
            'division' => $project->division?->name,
            'division_id' => $project->division_id,
            'loa_number' => $project->loa?->loa_number,
            'loa_id' => $project->loa_id,
            'contract_value' => $project->contract_value,
            'active_status' => $project->active_status,
            'created_at' => $project->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/projects/index', [
            'projects' => $projects,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function show(Project $project): Response
    {
        $project->load(['customer', 'division', 'loa.teamMembers']);
        $loa = $project->loa;

        $totalStations = $loa?->total_stations ?? 20;
        $stationsDone = (int) round($totalStations * 0.25);
        $stationsInProgress = (int) round($totalStations * 0.5);
        $stationsPending = max(0, $totalStations - $stationsDone - $stationsInProgress);

        $daysRemaining = $loa?->end_date ? max(0, (int) now()->diffInDays($loa->end_date, false)) : null;

        // BOQ billing progress, recent bills, and payment/station figures are
        // sample data — billing, BOQ-progress, and station-status tables don't
        // exist yet, so this dashboard is UI-first pending that data model.
        return Inertia::render('admin/projects/dashboard', [
            'project' => [
                'unique_id' => $project->unique_id,
                'name' => $project->name,
                'client' => $loa?->client ?? $project->customer?->name ?? '—',
                'division' => $project->division?->name ?? '—',
                'start_date' => $loa?->start_date?->format('Y-m-d'),
                'end_date' => $loa?->end_date?->format('Y-m-d'),
                'pm' => $loa?->teamMembers->firstWhere('role', 'Project Manager')?->name ?? 'Rajesh Kumar',
                'site_engineer' => $loa?->teamMembers->firstWhere('role', 'Site Engineer')?->name ?? 'Amit Singh',
                'billing_engineer' => $loa?->teamMembers->firstWhere('role', 'Billing Engineer')?->name ?? 'Priya Sharma',
                'total_stations' => $totalStations,
                'loa_number' => $loa?->loa_number,
            ],
            'metrics' => [
                'loa_value' => (float) ($loa?->contract_value_amount ?? $project->contract_value),
                'loa_value_unit' => $loa?->contract_value_unit ?? 'Cr',
                'work_completed_pct' => 38,
                'supply_pct' => 82,
                'installation_pct' => 70,
                'billing_pct' => 58,
                'payment_received_pct' => 67,
                'outstanding_amount' => 66.34,
                'outstanding_unit' => 'L',
                'days_remaining' => $daysRemaining,
                'est_profit_pct' => 27,
            ],
            'boq_items' => [
                ['name' => 'IP Camera 2MP', 'supply_pct' => 70, 'installation_pct' => 25, 'commissioning_pct' => 5, 'billed' => 87.20, 'billed_unit' => 'L', 'total' => 1.16, 'total_unit' => 'Cr', 'progress_pct' => 75],
                ['name' => 'UPS 1KVA', 'supply_pct' => 70, 'installation_pct' => 25, 'commissioning_pct' => 5, 'billed' => 59.72, 'billed_unit' => 'L', 'total' => 74.53, 'total_unit' => 'L', 'progress_pct' => 80],
                ['name' => 'HDPE Pipe', 'supply_pct' => 90, 'installation_pct' => 5, 'commissioning_pct' => 5, 'billed' => 39.75, 'billed_unit' => 'L', 'total' => 53.16, 'total_unit' => 'L', 'progress_pct' => 75],
                ['name' => 'OFC Laying', 'supply_pct' => 95, 'installation_pct' => 5, 'commissioning_pct' => 0, 'billed' => 21.97, 'billed_unit' => 'L', 'total' => 32.67, 'total_unit' => 'L', 'progress_pct' => 67],
                ['name' => 'NVR 32Ch', 'supply_pct' => 70, 'installation_pct' => 25, 'commissioning_pct' => 5, 'billed' => 16.36, 'billed_unit' => 'L', 'total' => 17.00, 'total_unit' => 'L', 'progress_pct' => 96],
                ['name' => 'PoE Switch', 'supply_pct' => 70, 'installation_pct' => 25, 'commissioning_pct' => 5, 'billed' => 10.64, 'billed_unit' => 'L', 'total' => 12.80, 'total_unit' => 'L', 'progress_pct' => 83],
                ['name' => 'Server Rack', 'supply_pct' => 90, 'installation_pct' => 5, 'commissioning_pct' => 5, 'billed' => 5.60, 'billed_unit' => 'L', 'total' => 5.70, 'total_unit' => 'L', 'progress_pct' => 98],
                ['name' => 'Civil Works', 'supply_pct' => 95, 'installation_pct' => 5, 'commissioning_pct' => 0, 'billed' => 14.25, 'billed_unit' => 'L', 'total' => 15.00, 'total_unit' => 'L', 'progress_pct' => 95],
            ],
            'recent_bills' => [
                ['bill_no' => 'BILL/2024/004', 'date' => '2024-12-15', 'gross' => 2500000, 'net_bill' => 2675000, 'status' => 'Submitted'],
                ['bill_no' => 'BILL/2024/003', 'date' => '2024-11-01', 'gross' => 3800000, 'net_bill' => 3959400, 'status' => 'Passed'],
                ['bill_no' => 'BILL/2024/002', 'date' => '2024-09-01', 'gross' => 4200000, 'net_bill' => 4384400, 'status' => 'Paid'],
                ['bill_no' => 'BILL/2024/001', 'date' => '2024-07-15', 'gross' => 8500000, 'net_bill' => 9073000, 'status' => 'Paid'],
            ],
            'station_summary' => [
                'done' => $stationsDone,
                'in_progress' => $stationsInProgress,
                'pending' => $stationsPending,
                'total' => $totalStations,
            ],
            'payment_summary' => [
                'total_billed' => 1.90,
                'total_billed_unit' => 'Cr',
                'received' => 1.35,
                'received_unit' => 'Cr',
                'outstanding' => 66.34,
                'outstanding_unit' => 'L',
                'received_pct' => 67,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/projects/create', $this->options());
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        Project::query()->create($request->validated());

        return redirect()->route('admin.projects.index')->with('success', 'Project created successfully.');
    }

    public function edit(Project $project): Response
    {
        return Inertia::render('admin/projects/edit', [
            'project' => $project->only([
                'unique_id',
                'name',
                'customer_id',
                'zone_id',
                'division_id',
                'loa_id',
                'contract_value',
                'active_status',
            ]),
            ...$this->options(),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $project->update($request->validated());

        return redirect()->route('admin.projects.index')->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $project->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.projects.index')->with('success', 'Project deleted successfully.');
    }

    /**
     * @return array<string, array<int, array{id: int, name: string}>>
     */
    private function options(): array
    {
        return [
            'customers' => Customer::query()->where('is_delete', false)->orderBy('name')->get(['id', 'name'])->toArray(),
            'zones' => Zone::query()->where('is_delete', false)->orderBy('name')->get(['id', 'name'])->toArray(),
            'divisions' => Division::query()->where('is_delete', false)->orderBy('name')->get(['id', 'name'])->toArray(),
            'loas' => Loa::query()->where('is_delete', false)->orderBy('loa_number')->get(['id', 'loa_number'])
                ->map(fn (Loa $loa) => ['id' => $loa->id, 'name' => $loa->loa_number])
                ->toArray(),
        ];
    }
}
