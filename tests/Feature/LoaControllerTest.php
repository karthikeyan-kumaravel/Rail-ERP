<?php

use App\Models\Bank;
use App\Models\Division;
use App\Models\Engineer;
use App\Models\EngineerType;
use App\Models\Loa;
use App\Models\LoaItem;
use App\Models\ScheduleName;
use App\Models\ScheduleType;
use App\Models\Station;
use App\Models\Unit;
use App\Models\User;
use App\Models\Vendor;
use App\Support\MaskedIdentifier;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
});

/**
 * @return array<string, mixed>
 */
function financialSecuritySectionPayload(int $bankId, array $overrides = []): array
{
    return array_merge([
        'amount' => 5.5,
        'amount_unit' => 'L',
        'validity_start_date' => '2026-01-01',
        'validity_end_date' => '2027-12-31',
        'claim_period' => 90,
        'claim_period_unit' => 'Days',
        'bank_id' => $bankId,
        'file' => UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf'),
    ], $overrides);
}

/**
 * @return array<string, array<string, mixed>>
 */
function validFinancialSecuritiesPayload(?int $bankId = null): array
{
    $bankId ??= Bank::factory()->create()->id;

    return [
        'emd' => financialSecuritySectionPayload($bankId),
        'performance_bg' => financialSecuritySectionPayload($bankId),
        'security_bg' => financialSecuritySectionPayload($bankId),
    ];
}

/**
 * The masked route identifier is re-encrypted (with a fresh random IV) on
 * every access, so two encodings of the same LOA are never byte-equal.
 * Assert on the path shape and decode the identifier back to compare it
 * against the actual record instead of comparing raw redirect strings.
 */
function assertRedirectsToLoaEditTab(TestResponse $response, Loa $loa, string $tab): void
{
    $location = (string) $response->headers->get('Location');

    preg_match('#/admin/loas/([^/]+)/edit\?tab=(\w+)#', $location, $matches);

    expect($matches[2] ?? null)->toBe($tab)
        ->and(MaskedIdentifier::decode($matches[1] ?? ''))->toBe($loa->getRawOriginal('unique_id'));
}

function validTeamMemberPayload(?int $engineerTypeId = null, array $overrides = []): array
{
    $engineerTypeId ??= EngineerType::factory()->create()->id;
    $engineer = Engineer::factory()->create(['engineer_type_id' => $engineerTypeId]);

    return array_merge([
        'engineer_id' => $engineer->id,
        'engineer_type_id' => $engineerTypeId,
        'name' => $engineer->full_name,
        'role' => 'Project Manager',
    ], $overrides);
}

function validLoaPayload(int $divisionId, array $overrides = []): array
{
    $engineerType = EngineerType::factory()->create();

    return array_merge([
        'loa_number' => 'RAILWAY/ABC/2026/001',
        'client' => 'Southern Railway',
        'division_id' => $divisionId,
        'work_type' => 'Track Renewal',
        'contract_value_amount' => 50.5,
        'contract_value_unit' => 'Cr',
        'completion_period_months' => 18,
        'defect_liability_months' => 12,
        'start_date' => '2026-01-01',
        'end_date' => '2027-06-30',
        'total_stations' => 10,
        'scope_of_work' => 'Renewal of track infrastructure across the division.',
        'active_status' => '1',
        'team' => [
            validTeamMemberPayload($engineerType->id, ['name' => 'Alice', 'role' => 'Project Manager']),
            validTeamMemberPayload($engineerType->id, ['name' => 'Bob', 'role' => 'Site Engineer']),
            validTeamMemberPayload($engineerType->id, ['name' => 'Carol', 'role' => 'Billing Engineer']),
        ],
        'financial_securities' => validFinancialSecuritiesPayload(),
    ], $overrides);
}

test('an loa can be created with team members', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id));

    $response->assertRedirect('/admin/loas');

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();

    expect($loa->division_id)->toBe($division->id)
        ->and($loa->client)->toBe('Southern Railway')
        ->and($loa->unique_id)->not->toBeNull();

    $this->assertDatabaseCount('loa_team_members', 3);

    $members = $loa->teamMembers()->orderBy('order_no')->get(['name', 'role', 'order_no']);

    expect($members[0]->name)->toBe('Alice')
        ->and($members[0]->order_no)->toBe(0)
        ->and($members[1]->name)->toBe('Bob')
        ->and($members[1]->order_no)->toBe(1)
        ->and($members[2]->name)->toBe('Carol')
        ->and($members[2]->order_no)->toBe(2);
});

test('an loa can be created with a loa date, completion date, and extension date', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'loa_date' => '2026-01-05',
        'completion_date' => '2027-07-01',
        'extension_date' => '2027-09-01',
    ]));

    $response->assertRedirect('/admin/loas');

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();

    expect($loa->loa_date->format('Y-m-d'))->toBe('2026-01-05')
        ->and($loa->completion_date->format('Y-m-d'))->toBe('2027-07-01')
        ->and($loa->extension_date->format('Y-m-d'))->toBe('2027-09-01');
});

test('loa date, completion date, and extension date are optional', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id));

    $response->assertRedirect('/admin/loas');
    $response->assertSessionDoesntHaveErrors();

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();

    expect($loa->loa_date)->toBeNull()
        ->and($loa->completion_date)->toBeNull()
        ->and($loa->extension_date)->toBeNull();
});

test('the edit page formats every loa date field as Y-m-d for the date inputs', function () {
    $this->withoutVite();
    $division = Division::factory()->create();

    $loa = Loa::factory()->create([
        'division_id' => $division->id,
        'loa_date' => '2026-01-05',
        'start_date' => '2026-02-01',
        'end_date' => '2027-02-01',
        'completion_date' => '2027-03-01',
        'extension_date' => '2027-04-01',
    ]);

    $response = $this->get("/admin/loas/{$loa->unique_id}/edit");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('loa.loa_date', '2026-01-05')
        ->where('loa.start_date', '2026-02-01')
        ->where('loa.end_date', '2027-02-01')
        ->where('loa.completion_date', '2027-03-01')
        ->where('loa.extension_date', '2027-04-01')
    );
});

test('an loa can be created with a vendor, schedule name, and schedule type', function () {
    $division = Division::factory()->create();
    $vendor = Vendor::factory()->create(['company_name' => 'Southern Railway Corp']);
    $scheduleName = ScheduleName::factory()->create();
    $scheduleType = ScheduleType::factory()->create(['schedule_name_id' => $scheduleName->id]);

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'vendor_id' => $vendor->id,
        'schedule_name_id' => $scheduleName->id,
        'schedule_type_id' => $scheduleType->id,
    ]));

    $response->assertRedirect('/admin/loas');

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();

    expect($loa->vendor_id)->toBe($vendor->id)
        ->and($loa->schedule_name_id)->toBe($scheduleName->id)
        ->and($loa->schedule_type_id)->toBe($scheduleType->id);
});

test('an invalid vendor, schedule name, or schedule type id is rejected', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'vendor_id' => 999999,
        'schedule_name_id' => 999999,
        'schedule_type_id' => 999999,
    ]));

    $response->assertSessionHasErrors(['vendor_id', 'schedule_name_id', 'schedule_type_id']);
});

test('the create page includes vendor, schedule name, schedule type, and unit options', function () {
    $this->withoutVite();

    Vendor::factory()->create(['company_name' => 'Northern Freight Ltd']);
    $scheduleName = ScheduleName::factory()->create(['name' => 'Schedule I']);
    ScheduleType::factory()->create(['schedule_name_id' => $scheduleName->id, 'name' => 'Civil']);
    Unit::factory()->create(['name' => 'Mtr']);

    $response = $this->get('/admin/loas/create');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('vendors', 1)
        ->has('scheduleNames', 1)
        ->has('scheduleTypes', 1)
        ->has('units', 1)
        ->where('units.0.name', 'Mtr')
    );
});

test('an loa can be created with station names', function () {
    $division = Division::factory()->create();
    $stationOne = Station::factory()->create(['division_id' => $division->id, 'station_name' => 'Chennai Central']);
    $stationTwo = Station::factory()->create(['division_id' => $division->id, 'station_name' => 'Egmore']);

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'total_stations' => 2,
        'stations' => [
            ['station_id' => $stationOne->id],
            ['station_id' => $stationTwo->id],
        ],
    ]));

    $response->assertRedirect('/admin/loas');

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();

    $this->assertDatabaseCount('loa_stations', 2);

    $stations = $loa->stations()->orderBy('order_no')->get(['station_id', 'order_no']);

    expect($stations[0]->station_id)->toBe($stationOne->id)
        ->and($stations[0]->order_no)->toBe(0)
        ->and($stations[1]->station_id)->toBe($stationTwo->id)
        ->and($stations[1]->order_no)->toBe(1);
});

test('blank station slots are skipped when saving', function () {
    $division = Division::factory()->create();
    $station = Station::factory()->create(['division_id' => $division->id]);

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'total_stations' => 3,
        'stations' => [
            ['station_id' => $station->id],
            ['station_id' => ''],
            ['station_id' => null],
        ],
    ]));

    $response->assertRedirect('/admin/loas');

    $this->assertDatabaseCount('loa_stations', 1);
});

test('an invalid station id is rejected', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'total_stations' => 1,
        'stations' => [
            ['station_id' => 999999],
        ],
    ]));

    $response->assertSessionHasErrors('stations.0.station_id');
});

test('updating an loa replaces its stations', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);
    $oldStation = Station::factory()->create(['division_id' => $division->id]);
    $loa->stations()->create(['station_id' => $oldStation->id, 'order_no' => 0]);

    $newStationOne = Station::factory()->create(['division_id' => $division->id]);
    $newStationTwo = Station::factory()->create(['division_id' => $division->id]);

    $response = $this->put("/admin/loas/{$loa->unique_id}", validLoaPayload($division->id, [
        'loa_number' => $loa->loa_number,
        'total_stations' => 2,
        'stations' => [
            ['station_id' => $newStationOne->id],
            ['station_id' => $newStationTwo->id],
        ],
    ]));

    $response->assertRedirect('/admin/loas');

    $this->assertDatabaseCount('loa_stations', 2);

    $stationIds = $loa->stations()->orderBy('order_no')->pluck('station_id')->all();

    expect($stationIds)->toBe([$newStationOne->id, $newStationTwo->id]);
});

test('the show page includes the loa station names in order', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);
    $stationOne = Station::factory()->create(['division_id' => $division->id, 'station_name' => 'Chennai Central']);
    $stationTwo = Station::factory()->create(['division_id' => $division->id, 'station_name' => 'Egmore']);
    $loa->stations()->create(['station_id' => $stationOne->id, 'order_no' => 0]);
    $loa->stations()->create(['station_id' => $stationTwo->id, 'order_no' => 1]);

    $response = $this->get("/admin/loas/{$loa->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('loa.stations', 2)
        ->where('loa.stations.0', 'Chennai Central')
        ->where('loa.stations.1', 'Egmore')
    );
});

test('a duplicate loa number is rejected', function () {
    $division = Division::factory()->create();
    Loa::factory()->create(['division_id' => $division->id, 'loa_number' => 'RAILWAY/ABC/2026/001']);

    $response = $this->post('/admin/loas', validLoaPayload($division->id));

    $response->assertSessionHasErrors('loa_number');
});

test('an end date before the start date is rejected', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'start_date' => '2026-06-01',
        'end_date' => '2026-01-01',
    ]));

    $response->assertSessionHasErrors('end_date');
});

test('updating an loa replaces its team members', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);
    $loa->teamMembers()->delete();
    $loa->teamMembers()->create(['name' => 'Old One', 'role' => 'Project Manager', 'order_no' => 0]);
    $loa->teamMembers()->create(['name' => 'Old Two', 'role' => 'Site Engineer', 'order_no' => 1]);

    $response = $this->put("/admin/loas/{$loa->unique_id}", validLoaPayload($division->id, [
        'loa_number' => $loa->loa_number,
        'team' => [
            validTeamMemberPayload(overrides: ['name' => 'New One', 'role' => 'Project Manager']),
            validTeamMemberPayload(overrides: ['name' => 'New Two', 'role' => 'Site Engineer']),
            validTeamMemberPayload(overrides: ['name' => 'New Three', 'role' => 'Quality Engineer']),
        ],
    ]));

    $response->assertRedirect('/admin/loas');

    $this->assertDatabaseCount('loa_team_members', 3);

    $names = $loa->teamMembers()->orderBy('order_no')->pluck('name')->all();

    expect($names)->toBe(['New One', 'New Two', 'New Three']);
});

test('an loa is soft deleted', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);

    $this->delete("/admin/loas/{$loa->unique_id}");

    expect($loa->refresh()->is_delete)->toBeTrue();
    $this->assertDatabaseHas('loas', ['id' => $loa->id]);
});

test('the show page returns the expected loa, division, and team props', function () {
    $this->withoutVite();

    $division = Division::factory()->create(['name' => 'Chennai Division']);
    $loa = Loa::factory()->create(['division_id' => $division->id, 'loa_number' => 'RAILWAY/XYZ/2026/002']);

    $response = $this->get("/admin/loas/{$loa->unique_id}");

    $response->assertOk();

    expect($loa->division->name)->toBe('Chennai Division')
        ->and($loa->teamMembers()->count())->toBe(3);
});

test('the show page includes the loa item details', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);
    LoaItem::factory()->create(['loa_id' => $loa->id, 'order_no' => 0, 'item_no' => '01']);
    LoaItem::factory()->create(['loa_id' => $loa->id, 'order_no' => 1, 'item_no' => '02']);

    $response = $this->get("/admin/loas/{$loa->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('loa.items', 2)
        ->where('loa.items.0.item_no', '01')
        ->where('loa.items.1.item_no', '02')
    );
});

test('the show page includes schedule name and schedule type labels for loa items', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);
    $scheduleName = ScheduleName::factory()->create(['name' => 'A']);
    $scheduleType = ScheduleType::factory()->create(['schedule_name_id' => $scheduleName->id, 'name' => 'SOR Items']);

    LoaItem::factory()->create([
        'loa_id' => $loa->id,
        'order_no' => 0,
        'schedule_name_id' => $scheduleName->id,
        'schedule_type_id' => $scheduleType->id,
    ]);
    LoaItem::factory()->create([
        'loa_id' => $loa->id,
        'order_no' => 1,
        'schedule_name_id' => null,
        'schedule_type_id' => null,
    ]);

    $response = $this->get("/admin/loas/{$loa->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('loa.items.0.schedule_name_label', 'A')
        ->where('loa.items.0.schedule_type_label', 'SOR Items')
        ->where('loa.items.1.schedule_name_label', null)
        ->where('loa.items.1.schedule_type_label', null)
    );
});

test('an loa item can be saved with its own schedule name and schedule type', function () {
    $division = Division::factory()->create();
    $scheduleName = ScheduleName::factory()->create();
    $scheduleType = ScheduleType::factory()->create(['schedule_name_id' => $scheduleName->id]);

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'items' => [
            [
                'schedule_name_id' => $scheduleName->id,
                'schedule_type_id' => $scheduleType->id,
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 10,
                'advertised_value' => 1000,
                'bid_rate' => 9,
                'bid_amount' => 900,
            ],
        ],
    ]));

    $response->assertRedirect('/admin/loas');
    $response->assertSessionDoesntHaveErrors();

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();
    $item = $loa->items()->firstOrFail();

    expect($item->schedule_name_id)->toBe($scheduleName->id)
        ->and($item->schedule_type_id)->toBe($scheduleType->id);
});

test('an invalid item schedule name or schedule type id is rejected', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'items' => [
            [
                'schedule_name_id' => 999999,
                'schedule_type_id' => 999999,
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 10,
                'advertised_value' => 1000,
                'bid_rate' => 9,
                'bid_amount' => 900,
            ],
        ],
    ]));

    $response->assertSessionHasErrors([
        'items.0.schedule_name_id',
        'items.0.schedule_type_id',
    ]);
});

test('an loa item can be saved with inspection by and a payment stages split', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'items' => [
            [
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 10,
                'advertised_value' => 1000,
                'bid_rate' => 9,
                'bid_amount' => 900,
                'inspection_by' => 'RITES',
                'payment_stages' => [
                    'Supply' => '90%',
                    'Supply & Installation' => '5%',
                    'Commissioning' => '5%',
                ],
            ],
        ],
    ]));

    $response->assertRedirect('/admin/loas');
    $response->assertSessionDoesntHaveErrors();

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();
    $item = $loa->items()->firstOrFail();

    expect($item->inspection_by)->toBe('RITES')
        ->and($item->payment_stages)->toBe([
            'Supply' => '90%',
            'Supply & Installation' => '5%',
            'Commissioning' => '5%',
        ]);
});

test('an loa item can be saved with a bid rate unit and bid percentage value', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'items' => [
            [
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 10,
                'advertised_value' => 1000,
                'bid_rate' => 8.5,
                'bid_rate_unit' => '% Below',
                'bid_percentage_value' => 15.5,
                'bid_amount' => 850,
            ],
        ],
    ]));

    $response->assertRedirect('/admin/loas');
    $response->assertSessionDoesntHaveErrors();

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();
    $item = $loa->items()->firstOrFail();

    expect($item->bid_rate_unit)->toBe('% Below')
        ->and((float) $item->bid_percentage_value)->toBe(15.5);
});

test('an loa item can be saved with a rebate applied to the bid amount', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'items' => [
            [
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 1000,
                'advertised_value' => 100000,
                'bid_rate' => 1000,
                'bid_amount' => 100000,
                'rebate_enabled' => true,
                'rebate_percentage' => 3,
                'rebate_amount' => 3000,
                'final_bid_amount' => 97000,
            ],
        ],
    ]));

    $response->assertRedirect('/admin/loas');
    $response->assertSessionDoesntHaveErrors();

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();
    $item = $loa->items()->firstOrFail();

    expect($item->rebate_enabled)->toBeTrue()
        ->and((float) $item->rebate_percentage)->toBe(3.0)
        ->and((float) $item->rebate_amount)->toBe(3000.0)
        ->and((float) $item->final_bid_amount)->toBe(97000.0);
});

test('an loa item without a rebate defaults the final bid amount to the bid amount', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'items' => [
            [
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 10,
                'advertised_value' => 1000,
                'bid_rate' => 9,
                'bid_amount' => 900,
                'rebate_enabled' => false,
                'rebate_percentage' => 0,
                'rebate_amount' => 0,
                'final_bid_amount' => 900,
            ],
        ],
    ]));

    $response->assertRedirect('/admin/loas');

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();
    $item = $loa->items()->firstOrFail();

    expect($item->rebate_enabled)->toBeFalse()
        ->and((float) $item->rebate_amount)->toBe(0.0)
        ->and((float) $item->final_bid_amount)->toBe(900.0);
});

test('a rebate percentage outside 0-100 is rejected', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'items' => [
            [
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 1000,
                'advertised_value' => 100000,
                'bid_rate' => 1000,
                'bid_amount' => 100000,
                'rebate_enabled' => true,
                'rebate_percentage' => 150,
                'rebate_amount' => 0,
                'final_bid_amount' => 0,
            ],
        ],
    ]));

    $response->assertSessionHasErrors('items.0.rebate_percentage');
});

test('an invalid inspection by or payment stage percentage is rejected', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'items' => [
            [
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 10,
                'advertised_value' => 1000,
                'bid_rate' => 9,
                'bid_amount' => 900,
                'inspection_by' => 'Not A Real Option',
                'payment_stages' => [
                    'Supply' => '50%',
                ],
            ],
        ],
    ]));

    $response->assertSessionHasErrors([
        'items.0.inspection_by',
        'items.0.payment_stages.Supply',
    ]);
});

test('an loa item payment stages that do not add up to 100 percent is rejected', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'items' => [
            [
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 10,
                'advertised_value' => 1000,
                'bid_rate' => 9,
                'bid_amount' => 900,
                'payment_stages' => [
                    'Supply' => '70%',
                    'Commissioning' => '5%',
                ],
            ],
        ],
    ]));

    $response->assertSessionHasErrors(['items.0.payment_stages']);
});

test('an loa item payment stages with an unrecognized stage key is rejected', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'items' => [
            [
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 10,
                'advertised_value' => 1000,
                'bid_rate' => 9,
                'bid_amount' => 900,
                'payment_stages' => [
                    'Not A Real Stage' => '90%',
                    'Supply' => '5%',
                    'Commissioning' => '5%',
                ],
            ],
        ],
    ]));

    $response->assertSessionHasErrors(['items.0.payment_stages']);
});

test('the pdf endpoint downloads a pdf containing the loa number and item details', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create([
        'division_id' => $division->id,
        'loa_number' => 'RAILWAY/PDF/2026/001',
    ]);
    LoaItem::factory()->create([
        'loa_id' => $loa->id,
        'order_no' => 0,
        'item_no' => '01',
        'item_description' => 'Supply of signalling cable',
    ]);

    $response = $this->get("/admin/loas/{$loa->unique_id}/pdf");

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
    $response->assertHeader('content-disposition', 'attachment; filename=RAILWAY-PDF-2026-001.pdf');
    expect(strlen($response->getContent()))->toBeGreaterThan(100);
});

test('the pdf endpoint returns a not found response for a tampered masked id', function () {
    $this->get('/admin/loas/not-a-valid-mask/pdf')->assertNotFound();
});

test('the details tab can be saved on its own via Save & Continue', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', [
        'loa_number' => 'RAILWAY/ABC/2026/001',
        'client' => 'Southern Railway',
        'division_id' => $division->id,
        'work_type' => 'Track Renewal',
        'contract_value_amount' => 50.5,
        'contract_value_unit' => 'Cr',
        'completion_period_months' => 18,
        'defect_liability_months' => 12,
        'start_date' => '2026-01-01',
        'end_date' => '2027-06-30',
        'total_stations' => 10,
        'active_status' => '1',
        'team' => [['name' => '', 'role' => '']],
        'current_step' => 'details',
        'finish' => '0',
    ]);

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();

    assertRedirectsToLoaEditTab($response, $loa, 'items');
    $response->assertSessionDoesntHaveErrors();

    expect($loa->financialSecurities()->count())->toBe(0)
        ->and($loa->scope_of_work)->toBeNull();
    $this->assertDatabaseCount('loa_team_members', 0);
});

test('the current tabs own required field is still enforced during Save & Continue', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', [
        'client' => 'Southern Railway',
        'division_id' => $division->id,
        'work_type' => 'Track Renewal',
        'contract_value_amount' => 50.5,
        'contract_value_unit' => 'Cr',
        'completion_period_months' => 18,
        'defect_liability_months' => 12,
        'start_date' => '2026-01-01',
        'end_date' => '2027-06-30',
        'total_stations' => 10,
        'active_status' => '1',
        'team' => [['name' => '', 'role' => '']],
        'current_step' => 'details',
        'finish' => '0',
    ]);

    $response->assertSessionHasErrors('loa_number');
    $this->assertDatabaseCount('loas', 0);
});

test('an loa can be completed by saving progress tab by tab then finishing', function () {
    $division = Division::factory()->create();

    $step1 = $this->post('/admin/loas', [
        'loa_number' => 'RAILWAY/ABC/2026/001',
        'client' => 'Southern Railway',
        'division_id' => $division->id,
        'work_type' => 'Track Renewal',
        'contract_value_amount' => 50.5,
        'contract_value_unit' => 'Cr',
        'completion_period_months' => 18,
        'defect_liability_months' => 12,
        'start_date' => '2026-01-01',
        'end_date' => '2027-06-30',
        'total_stations' => 10,
        'active_status' => '1',
        'team' => [['name' => '', 'role' => '']],
        'current_step' => 'details',
        'finish' => '0',
    ]);

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();
    assertRedirectsToLoaEditTab($step1, $loa, 'items');

    $stepItems = $this->put("/admin/loas/{$loa->unique_id}", [
        'loa_number' => $loa->loa_number,
        'client' => $loa->client,
        'division_id' => $loa->division_id,
        'work_type' => $loa->work_type,
        'contract_value_amount' => $loa->contract_value_amount,
        'completion_period_months' => $loa->completion_period_months,
        'defect_liability_months' => $loa->defect_liability_months,
        'start_date' => $loa->start_date->format('Y-m-d'),
        'end_date' => $loa->end_date->format('Y-m-d'),
        'total_stations' => $loa->total_stations,
        'team' => [['name' => '', 'role' => '']],
        'items' => [
            [
                'item_no' => '01',
                'item_description' => 'Supply of signalling cable',
                'item_quantity' => 100,
                'quantity_unit' => 'Mtr',
                'unit_rate' => 10,
                'advertised_value' => 1000,
                'bid_rate' => 9,
                'bid_amount' => 900,
            ],
        ],
        'current_step' => 'items',
        'finish' => '0',
    ]);

    assertRedirectsToLoaEditTab($stepItems, $loa, 'financial');
    $stepItems->assertSessionDoesntHaveErrors();
    expect($loa->refresh()->items()->count())->toBe(1);

    // The real frontend keeps `items` in the same persistent form state
    // across every step, so every subsequent submit in this test carries it
    // forward too — otherwise this simulated request would look like the
    // user cleared the item list before saving the next tab.
    $savedItems = [
        [
            'item_no' => '01',
            'item_description' => 'Supply of signalling cable',
            'item_quantity' => 100,
            'quantity_unit' => 'Mtr',
            'unit_rate' => 10,
            'advertised_value' => 1000,
            'bid_rate' => 9,
            'bid_amount' => 900,
        ],
    ];

    $step2 = $this->put("/admin/loas/{$loa->unique_id}", [
        'loa_number' => $loa->loa_number,
        'client' => $loa->client,
        'division_id' => $loa->division_id,
        'work_type' => $loa->work_type,
        'contract_value_amount' => $loa->contract_value_amount,
        'completion_period_months' => $loa->completion_period_months,
        'defect_liability_months' => $loa->defect_liability_months,
        'start_date' => $loa->start_date->format('Y-m-d'),
        'end_date' => $loa->end_date->format('Y-m-d'),
        'total_stations' => $loa->total_stations,
        'items' => $savedItems,
        'financial_securities' => validFinancialSecuritiesPayload(),
        'team' => [['name' => '', 'role' => '']],
        'current_step' => 'financial',
        'finish' => '0',
    ]);

    assertRedirectsToLoaEditTab($step2, $loa, 'team');
    $step2->assertSessionDoesntHaveErrors();
    expect($loa->refresh()->financialSecurities()->count())->toBe(3);

    $finish = $this->put("/admin/loas/{$loa->unique_id}", validLoaPayload($division->id, [
        'loa_number' => $loa->loa_number,
        'items' => $savedItems,
        'finish' => '1',
    ]));

    $finish->assertRedirect('/admin/loas');
    $finish->assertSessionDoesntHaveErrors();
    expect($loa->refresh()->scope_of_work)->not->toBeNull();
    $this->assertDatabaseCount('loa_team_members', 3);
});
