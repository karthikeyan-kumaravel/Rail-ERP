<?php

use App\Models\City;
use App\Models\District;
use App\Models\Division;
use App\Models\State;
use App\Models\Station;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

/**
 * @param  array<int, array<string, string>>  $rows
 */
function buildStationImportFile(array $rows): UploadedFile
{
    $headings = [
        'Station Code *', 'Station Name *', 'Zone *', 'Division *',
        'State', 'District', 'City', 'Address', 'Latitude', 'Longitude', 'Status',
    ];
    $keys = [
        'station_code', 'station_name', 'zone', 'division',
        'state', 'district', 'city', 'address', 'latitude', 'longitude', 'status',
    ];

    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->fromArray($headings, null, 'A1');

    foreach ($rows as $rowIndex => $row) {
        $values = array_map(fn ($key) => $row[$key] ?? '', $keys);
        $sheet->fromArray($values, null, 'A'.($rowIndex + 2));
    }

    $path = tempnam(sys_get_temp_dir(), 'station-import').'.xlsx';
    (new Xlsx($spreadsheet))->save($path);

    return new UploadedFile($path, 'stations.xlsx', null, null, true);
}

test('a station row with no state, district, city, or address previews and commits successfully', function () {
    $zone = Zone::factory()->create(['name' => 'Southern Railway']);
    $division = Division::factory()->create(['zone_id' => $zone->id, 'name' => 'Chennai']);

    $file = buildStationImportFile([[
        'station_code' => 'MAS',
        'station_name' => 'Chennai Central',
        'zone' => 'Southern Railway',
        'division' => 'Chennai',
        'status' => 'Active',
    ]]);

    $preview = $this->postJson('/admin/imports/stations/preview', ['file' => $file]);
    $preview->assertOk();
    $preview->assertJsonPath('summary.preview_valid_records', 1);
    $preview->assertJsonPath('summary.failed_records', 0);

    $token = $preview->json('token');

    $commit = $this->postJson('/admin/imports/stations/store', ['token' => $token]);
    $commit->assertOk();
    $commit->assertJsonPath('summary.successfully_imported', 1);

    $station = Station::query()->where('station_code', 'MAS')->firstOrFail();

    expect($station->division_id)->toBe($division->id)
        ->and($station->state_id)->toBeNull()
        ->and($station->district_id)->toBeNull()
        ->and($station->city_id)->toBeNull()
        ->and($station->address)->toBeNull();
});

test('a station row still requires station code, station name, zone, and division', function () {
    $file = buildStationImportFile([[
        'status' => 'Active',
    ]]);

    $preview = $this->postJson('/admin/imports/stations/preview', ['file' => $file]);
    $preview->assertOk();
    $preview->assertJsonPath('summary.preview_valid_records', 0);
    $preview->assertJsonPath('summary.failed_records', 1);

    $errors = collect($preview->json('rows'))->first()['errors'];

    expect($errors)->toContain('Station Code is required.')
        ->and($errors)->toContain('Station Name is required.')
        ->and($errors)->toContain('Zone is required.')
        ->and($errors)->toContain('Division is required.');
});

test('a station row with a full valid location previews and commits successfully', function () {
    $zone = Zone::factory()->create(['name' => 'Southern Railway']);
    $division = Division::factory()->create(['zone_id' => $zone->id, 'name' => 'Chennai']);
    $state = State::factory()->create(['name' => 'Tamil Nadu']);
    $district = District::factory()->create(['state_id' => $state->id, 'name' => 'Chennai']);
    $city = City::factory()->create(['state_id' => $state->id, 'district_id' => $district->id, 'name' => 'Chennai']);

    $file = buildStationImportFile([[
        'station_code' => 'MAS',
        'station_name' => 'Chennai Central',
        'zone' => 'Southern Railway',
        'division' => 'Chennai',
        'state' => 'Tamil Nadu',
        'district' => 'Chennai',
        'city' => 'Chennai',
        'address' => 'Station Road, Chennai',
        'status' => 'Active',
    ]]);

    $preview = $this->postJson('/admin/imports/stations/preview', ['file' => $file]);
    $preview->assertOk();
    $preview->assertJsonPath('summary.preview_valid_records', 1);

    $token = $preview->json('token');
    $commit = $this->postJson('/admin/imports/stations/store', ['token' => $token]);
    $commit->assertOk();

    $station = Station::query()->where('station_code', 'MAS')->firstOrFail();

    expect($station->state_id)->toBe($state->id)
        ->and($station->district_id)->toBe($district->id)
        ->and($station->city_id)->toBe($city->id)
        ->and($station->address)->toBe('Station Road, Chennai');
});

test('a station row with district but no state fails preview', function () {
    $zone = Zone::factory()->create(['name' => 'Southern Railway']);
    Division::factory()->create(['zone_id' => $zone->id, 'name' => 'Chennai']);

    $file = buildStationImportFile([[
        'station_code' => 'MAS',
        'station_name' => 'Chennai Central',
        'zone' => 'Southern Railway',
        'division' => 'Chennai',
        'district' => 'Chennai',
        'status' => 'Active',
    ]]);

    $preview = $this->postJson('/admin/imports/stations/preview', ['file' => $file]);
    $preview->assertOk();
    $preview->assertJsonPath('summary.preview_valid_records', 0);
    $preview->assertJsonPath('summary.failed_records', 1);

    $errors = collect($preview->json('rows'))->first()['errors'];

    expect($errors)->toContain('State is required when District is provided.');
});

test('a station row with city but no district fails preview', function () {
    $zone = Zone::factory()->create(['name' => 'Southern Railway']);
    Division::factory()->create(['zone_id' => $zone->id, 'name' => 'Chennai']);
    $state = State::factory()->create(['name' => 'Tamil Nadu']);

    $file = buildStationImportFile([[
        'station_code' => 'MAS',
        'station_name' => 'Chennai Central',
        'zone' => 'Southern Railway',
        'division' => 'Chennai',
        'state' => 'Tamil Nadu',
        'city' => 'Chennai',
        'status' => 'Active',
    ]]);

    $preview = $this->postJson('/admin/imports/stations/preview', ['file' => $file]);
    $preview->assertOk();
    $preview->assertJsonPath('summary.preview_valid_records', 0);
    $preview->assertJsonPath('summary.failed_records', 1);

    $errors = collect($preview->json('rows'))->first()['errors'];

    expect($errors)->toContain('District is required when City is provided.');
});
