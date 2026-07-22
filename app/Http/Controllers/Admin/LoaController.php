<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HasPaginatedIndex;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreLoaRequest;
use App\Http\Requests\Admin\UpdateLoaRequest;
use App\Models\Bank;
use App\Models\Division;
use App\Models\EngineerType;
use App\Models\Loa;
use App\Models\LoaFinancialSecurity;
use App\Models\LoaItem;
use App\Models\LoaStation;
use App\Models\ScheduleName;
use App\Models\ScheduleType;
use App\Models\Station;
use App\Models\Unit;
use App\Models\Vendor;
use App\Support\LoaFormSteps;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class LoaController extends Controller
{
    use HasPaginatedIndex;

    /**
     * The Loa columns that are mass-assignable and safe to expose to the frontend as-is.
     *
     * @var array<int, string>
     */
    private const array FILLABLE_COLUMNS = [
        'loa_number',
        'client',
        'vendor_id',
        'division_id',
        'schedule_name_id',
        'schedule_type_id',
        'work_type',
        'contract_value_amount',
        'contract_value_unit',
        'completion_period_months',
        'defect_liability_months',
        'start_date',
        'end_date',
        'total_stations',
        'mobilization_advance_amount',
        'mobilization_advance_unit',
        'mobilization_advance_status',
        'scope_of_work',
        'active_status',
        'is_delete',
    ];

    /**
     * The LoaItem columns rendered in the edit form, view page, and PDF export.
     *
     * @var array<int, string>
     */
    private const array ITEM_COLUMNS = [
        'schedule_name_id',
        'schedule_type_id',
        'schedule_name',
        'schedule_advertised_value',
        'item_no',
        'item_description',
        'item_code',
        'item_quantity',
        'quantity_unit',
        'unit_rate',
        'escalation',
        'advertised_value',
        'bid_rate',
        'bid_rate_unit',
        'bid_percentage_value',
        'bid_amount',
        'rebate_enabled',
        'rebate_percentage',
        'rebate_amount',
        'final_bid_amount',
        'inspection_by',
        'payment_stages',
    ];

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $sort = $request->string('sort', 'loa_number')->toString();
        $direction = $request->string('direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $perPage = $this->resolvePerPage($request);

        if (! in_array($sort, ['loa_number', 'client', 'end_date', 'created_at'], true)) {
            $sort = 'loa_number';
        }

        $query = Loa::query()
            ->with('division:id,name')
            ->where('is_delete', false)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('loa_number', 'like', "%{$search}%")
                        ->orWhere('client', 'like', "%{$search}%")
                        ->orWhere('work_type', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction);

        $loas = $this->paginateQuery($query, $perPage);

        $loas->through(fn (Loa $loa) => [
            'unique_id' => $loa->unique_id,
            'loa_number' => $loa->loa_number,
            'client' => $loa->client,
            'division' => $loa->division?->name,
            'work_type' => $loa->work_type,
            'contract_value_amount' => $loa->contract_value_amount,
            'contract_value_unit' => $loa->contract_value_unit,
            'start_date' => $loa->start_date?->format('d M Y'),
            'end_date' => $loa->end_date?->format('d M Y'),
            'active_status' => $loa->active_status,
            'created_at' => $loa->created_at?->format('d M Y'),
        ]);

        return Inertia::render('admin/loas/index', [
            'loas' => $loas,
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
        return Inertia::render('admin/loas/create', [
            'divisions' => $this->divisionOptions(),
            'scheduleNames' => $this->scheduleNameOptions(),
            'scheduleTypes' => $this->scheduleTypeOptions(),
            'vendors' => $this->vendorOptions(),
            'stations' => $this->stationOptions(),
            'units' => $this->unitOptions(),
            'banks' => $this->bankOptions(),
            'engineerTypes' => $this->engineerTypeOptions(),
        ]);
    }

    public function store(StoreLoaRequest $request): RedirectResponse
    {
        $loa = DB::transaction(function () use ($request) {
            $loa = Loa::query()->create(
                $request->safe()->except(['team', 'items', 'stations', 'financial_securities']),
            );

            $this->replaceTeamMembers($loa, $request->validated('team', []));
            $this->replaceItems($loa, $request->validated('items', []));
            $this->replaceStations($loa, $request->validated('stations', []));
            $this->syncFinancialSecurities($loa, $request->validated('financial_securities', []));

            return $loa;
        });

        if (! $request->boolean('finish', true)) {
            return redirect($this->resumeUrl($loa, $request->string('current_step')->toString()))
                ->with('success', 'Progress saved.');
        }

        return redirect()->route('admin.loas.index')->with('success', 'LOA created successfully.');
    }

    public function edit(Request $request, Loa $loa): Response
    {
        $resumeTab = $request->query('tab');

        return Inertia::render('admin/loas/edit', [
            'resumeTab' => in_array($resumeTab, LoaFormSteps::TAB_ORDER, true) ? $resumeTab : null,
            'loa' => [
                'unique_id' => $loa->unique_id,
                ...$loa->only(self::FILLABLE_COLUMNS),
                'team' => $loa->teamMembers()
                    ->orderBy('order_no')
                    ->get(['engineer_id', 'engineer_type_id', 'name', 'role'])
                    ->toArray(),
                'items' => $loa->items()->orderBy('order_no')->get(self::ITEM_COLUMNS)->toArray(),
                'stations' => $loa->stations()->orderBy('order_no')->get(['station_id'])->toArray(),
                'financial_securities' => $this->financialSecurityPayload($loa),
            ],
            'divisions' => $this->divisionOptions(),
            'scheduleNames' => $this->scheduleNameOptions(),
            'scheduleTypes' => $this->scheduleTypeOptions(),
            'vendors' => $this->vendorOptions(),
            'stations' => $this->stationOptions(),
            'units' => $this->unitOptions(),
            'banks' => $this->bankOptions(),
            'engineerTypes' => $this->engineerTypeOptions(),
        ]);
    }

    public function update(UpdateLoaRequest $request, Loa $loa): RedirectResponse
    {
        DB::transaction(function () use ($request, $loa) {
            $loa->update($request->safe()->except(['team', 'items', 'stations', 'financial_securities']));

            $this->replaceTeamMembers($loa, $request->validated('team', []));
            $this->replaceItems($loa, $request->validated('items', []));
            $this->replaceStations($loa, $request->validated('stations', []));
            $this->syncFinancialSecurities($loa, $request->validated('financial_securities', []));
        });

        if (! $request->boolean('finish', true)) {
            return redirect($this->resumeUrl($loa, $request->string('current_step')->toString()))
                ->with('success', 'Progress saved.');
        }

        return redirect()->route('admin.loas.index')->with('success', 'LOA updated successfully.');
    }

    public function show(Loa $loa): Response
    {
        $items = $loa->items()
            ->orderBy('order_no')
            ->with(['scheduleName:id,name', 'scheduleType:id,name'])
            ->get(self::ITEM_COLUMNS)
            ->map(fn (LoaItem $item) => [
                ...$item->only(self::ITEM_COLUMNS),
                'schedule_name_label' => $item->scheduleName?->name,
                'schedule_type_label' => $item->scheduleType?->name,
            ]);

        return Inertia::render('admin/loas/show', [
            'loa' => [
                'unique_id' => $loa->unique_id,
                ...$loa->only(self::FILLABLE_COLUMNS),
                'division' => $loa->division?->name,
                'schedule_name' => $loa->scheduleName?->name,
                'schedule_type' => $loa->scheduleType?->name,
                'team' => $loa->teamMembers()->orderBy('order_no')->get(['name', 'role']),
                'items' => $items,
                'stations' => $loa->stations()
                    ->orderBy('order_no')
                    ->with('station:id,station_name')
                    ->get()
                    ->map(fn (LoaStation $loaStation) => $loaStation->station?->station_name)
                    ->toArray(),
                'financial_securities' => $this->financialSecurityDisplay($loa),
            ],
        ]);
    }

    public function pdf(Loa $loa): HttpResponse
    {
        $loa->loadMissing([
            'division',
            'scheduleName',
            'scheduleType',
            'teamMembers' => fn ($query) => $query->orderBy('order_no'),
        ]);
        $items = $loa->items()
            ->orderBy('order_no')
            ->with(['scheduleName:id,name', 'scheduleType:id,name'])
            ->get(self::ITEM_COLUMNS);
        $financialSecurities = $loa->financialSecurities()
            ->with('bank:id,name')
            ->get();

        $pdf = Pdf::loadView('pdf.loa', [
            'loa' => $loa,
            'items' => $items,
            'financialSecurities' => $financialSecurities,
        ])->setPaper('a4', 'portrait');

        $filename = Str::of($loa->loa_number ?? 'loa')
            ->replaceMatches('/[^A-Za-z0-9]+/', '-')
            ->trim('-')
            ->append('.pdf')
            ->toString();

        return $pdf->download($filename);
    }

    public function destroy(Loa $loa): RedirectResponse
    {
        $loa->update([
            'is_delete' => true,
        ]);

        return redirect()->route('admin.loas.index')->with('success', 'LOA deleted successfully.');
    }

    /**
     * The edit URL for the tab that follows $currentStep in the
     * "Save & Continue" wizard, or the plain edit URL once the last tab has
     * been reached.
     */
    private function resumeUrl(Loa $loa, string $currentStep): string
    {
        $url = route('admin.loas.edit', $loa);
        $nextTab = LoaFormSteps::nextTab($currentStep);

        return $nextTab !== null ? "{$url}?tab={$nextTab}" : $url;
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function divisionOptions(): array
    {
        return Division::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function unitOptions(): array
    {
        return Unit::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
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

    /**
     * @return array<int, array{id: int, name: string, schedule_name_id: int}>
     */
    private function scheduleTypeOptions(): array
    {
        return ScheduleType::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name', 'schedule_name_id'])
            ->toArray();
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function vendorOptions(): array
    {
        return Vendor::query()
            ->where('is_delete', false)
            ->orderBy('company_name')
            ->get(['id', 'company_name'])
            ->map(fn (Vendor $vendor) => ['id' => $vendor->id, 'name' => $vendor->company_name])
            ->toArray();
    }

    /**
     * @return array<int, array{id: int, name: string, division_id: int}>
     */
    private function stationOptions(): array
    {
        return Station::query()
            ->where('is_delete', false)
            ->orderBy('station_name')
            ->get(['id', 'station_name', 'division_id'])
            ->map(fn (Station $station) => [
                'id' => $station->id,
                'name' => $station->station_name,
                'division_id' => $station->division_id,
            ])
            ->toArray();
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function bankOptions(): array
    {
        return Bank::query()
            ->where('is_delete', false)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->toArray();
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
     * The Financial Security tab's current values for the edit form, keyed
     * by security type with a blank shape for any type not yet saved.
     *
     * @return array<string, array<string, mixed>>
     */
    private function financialSecurityPayload(Loa $loa): array
    {
        $existing = $loa->financialSecurities()->get()->keyBy('security_type');

        return collect(LoaFinancialSecurity::TYPES)->mapWithKeys(function (string $type) use ($existing) {
            $record = $existing->get($type);

            return [$type => [
                'amount' => $record?->amount,
                'amount_unit' => $record?->amount_unit ?? 'L',
                'validity_start_date' => $record?->validity_start_date?->format('Y-m-d'),
                'validity_end_date' => $record?->validity_end_date?->format('Y-m-d'),
                'claim_period' => $record?->claim_period,
                'claim_period_unit' => $record?->claim_period_unit ?? 'Days',
                'bank_id' => $record?->bank_id,
                'existing_file_url' => $record?->file_path ? Storage::disk('public')->url($record->file_path) : null,
                'existing_file_name' => $record?->original_file_name,
            ]];
        })->all();
    }

    /**
     * The Financial Security tab's values for the read-only show page.
     *
     * @return array<string, array<string, mixed>>
     */
    private function financialSecurityDisplay(Loa $loa): array
    {
        $existing = $loa->financialSecurities()->with('bank:id,name')->get()->keyBy('security_type');

        return collect(LoaFinancialSecurity::TYPES)->mapWithKeys(function (string $type) use ($existing) {
            $record = $existing->get($type);

            return [$type => [
                'amount' => $record?->amount,
                'amount_unit' => $record?->amount_unit,
                'validity_start_date' => $record?->validity_start_date?->format('d M Y'),
                'validity_end_date' => $record?->validity_end_date?->format('d M Y'),
                'claim_period' => $record?->claim_period,
                'claim_period_unit' => $record?->claim_period_unit,
                'bank' => $record?->bank?->name,
                'file_url' => $record?->file_path ? Storage::disk('public')->url($record->file_path) : null,
                'file_name' => $record?->original_file_name,
            ]];
        })->all();
    }

    /**
     * Upserts the EMD/Performance BG/Security BG record for each known
     * security type. Unlike team/items/stations, these rows are never
     * deleted-and-recreated: they carry an uploaded file, so an untouched
     * section (no new upload, no removal requested) must keep its existing
     * file_path rather than being wiped and re-created blank.
     *
     * @param  array<string, array<string, mixed>>  $sections
     */
    private function syncFinancialSecurities(Loa $loa, array $sections): void
    {
        foreach (LoaFinancialSecurity::TYPES as $type) {
            $section = $sections[$type] ?? null;

            if ($section === null) {
                continue;
            }

            $isBlank = blank($section['amount'] ?? null)
                && blank($section['bank_id'] ?? null)
                && blank($section['validity_start_date'] ?? null)
                && blank($section['validity_end_date'] ?? null)
                && blank($section['claim_period'] ?? null)
                && ! ($section['file'] ?? null) instanceof UploadedFile;

            if ($isBlank) {
                continue;
            }

            $existing = $loa->financialSecurities()->where('security_type', $type)->first();

            $attributes = [
                'amount' => $section['amount'] ?? null,
                'amount_unit' => $section['amount_unit'] ?? 'L',
                'validity_start_date' => $section['validity_start_date'] ?? null,
                'validity_end_date' => $section['validity_end_date'] ?? null,
                'claim_period' => $section['claim_period'] ?? null,
                'claim_period_unit' => $section['claim_period_unit'] ?? 'Days',
                'bank_id' => $section['bank_id'] ?? null,
            ];

            $file = $section['file'] ?? null;

            if ($file instanceof UploadedFile) {
                if ($existing?->file_path) {
                    Storage::disk('public')->delete($existing->file_path);
                }

                $attributes['file_path'] = $file->store('loas/financial-securities', 'public');
                $attributes['original_file_name'] = $file->getClientOriginalName();
            } elseif (($section['remove_file'] ?? false) && $existing?->file_path) {
                Storage::disk('public')->delete($existing->file_path);
                $attributes['file_path'] = null;
                $attributes['original_file_name'] = null;
            }

            $loa->financialSecurities()->updateOrCreate(['security_type' => $type], $attributes);
        }
    }

    /**
     * @param  array<int, array{engineer_id?: int|null, engineer_type_id?: int|null, name?: string|null, role?: string|null}>  $members
     */
    private function replaceTeamMembers(Loa $loa, array $members): void
    {
        $loa->teamMembers()->delete();

        $orderNo = 0;

        foreach ($members as $member) {
            // A "Save & Continue" step before the Team tab is ever reached
            // still submits the form's seeded blank team member — skip it
            // rather than persisting an empty row.
            if (empty($member['engineer_id']) && empty($member['engineer_type_id'])
                && empty($member['name']) && empty($member['role'])) {
                continue;
            }

            $loa->teamMembers()->create([
                'engineer_id' => $member['engineer_id'] ?? null,
                'engineer_type_id' => $member['engineer_type_id'] ?? null,
                'name' => $member['name'] ?? '',
                'role' => $member['role'] ?? '',
                'order_no' => $orderNo,
            ]);

            $orderNo++;
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    private function replaceItems(Loa $loa, array $items): void
    {
        $loa->items()->delete();

        foreach ($items as $index => $item) {
            $loa->items()->create([
                ...$item,
                'order_no' => $index,
            ]);
        }
    }

    /**
     * @param  array<int, array{station_id?: int|string|null}>  $stations
     */
    private function replaceStations(Loa $loa, array $stations): void
    {
        $loa->stations()->delete();

        $orderNo = 0;

        foreach ($stations as $station) {
            if (empty($station['station_id'])) {
                continue;
            }

            $loa->stations()->create([
                'station_id' => $station['station_id'],
                'order_no' => $orderNo,
            ]);

            $orderNo++;
        }
    }
}
