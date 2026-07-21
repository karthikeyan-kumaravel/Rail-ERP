<?php

use App\Models\City;
use App\Models\District;
use App\Models\Division;
use App\Models\State;
use App\Models\Station;
use App\Models\User;
use App\Models\Zone;

beforeEach(function () {
    $this->actingAs(User::factory()->create());

    $this->stationLocationAttributes = function (): array {
        $state = State::factory()->create();
        $district = District::factory()->create(['state_id' => $state->id]);
        $city = City::factory()->create([
            'state_id' => $state->id,
            'district_id' => $district->id,
        ]);

        return [
            'state_id' => $state->id,
            'district_id' => $district->id,
            'city_id' => $city->id,
            'address' => 'Station Road, Chennai',
            'latitude' => '13.0826800',
            'longitude' => '80.2707200',
        ];
    };
});

test('a station can be created with a division that belongs to the given zone', function () {
    $zone = Zone::factory()->create();
    $division = Division::factory()->create(['zone_id' => $zone->id]);

    $location = ($this->stationLocationAttributes)();

    $response = $this->post('/admin/stations', array_merge([
        'zone_id' => $zone->id,
        'division_id' => $division->id,
        'station_code' => 'MAS',
        'station_name' => 'Chennai Central',
        'active_status' => '1',
    ], $location));

    $response->assertRedirect('/admin/stations');

    $station = Station::query()->where('station_code', 'MAS')->firstOrFail();

    expect($station->zone_id)->toBe($zone->id)
        ->and($station->division_id)->toBe($division->id)
        ->and($station->station_name)->toBe('Chennai Central')
        ->and($station->state_id)->toBe($location['state_id'])
        ->and($station->district_id)->toBe($location['district_id'])
        ->and($station->city_id)->toBe($location['city_id'])
        ->and($station->address)->toBe('Station Road, Chennai')
        ->and($station->unique_id)->not->toBeNull();
});

test('a station is rejected if the division does not belong to the given zone', function () {
    $zone = Zone::factory()->create();
    $otherZone = Zone::factory()->create();
    $division = Division::factory()->create(['zone_id' => $otherZone->id]);

    $response = $this->post('/admin/stations', array_merge([
        'zone_id' => $zone->id,
        'division_id' => $division->id,
        'station_code' => 'MAS',
        'station_name' => 'Chennai Central',
        'active_status' => '1',
    ], ($this->stationLocationAttributes)()));

    $response->assertSessionHasErrors('division_id');
});

test('a duplicate station code is rejected', function () {
    Station::factory()->create(['station_code' => 'MAS']);

    $zone = Zone::factory()->create();
    $division = Division::factory()->create(['zone_id' => $zone->id]);

    $response = $this->post('/admin/stations', array_merge([
        'zone_id' => $zone->id,
        'division_id' => $division->id,
        'station_code' => 'MAS',
        'station_name' => 'Another Station',
        'active_status' => '1',
    ], ($this->stationLocationAttributes)()));

    $response->assertSessionHasErrors('station_code');
});

test('a station is soft deleted', function () {
    $station = Station::factory()->create();

    $this->delete("/admin/stations/{$station->unique_id}");

    expect($station->refresh()->is_delete)->toBeTrue();
    $this->assertDatabaseHas('stations', ['id' => $station->id]);
});

test('a station keeps its own station code when updated', function () {
    $station = Station::factory()->create(['station_code' => 'MAS']);

    $response = $this->put("/admin/stations/{$station->unique_id}", [
        'zone_id' => $station->zone_id,
        'division_id' => $station->division_id,
        'state_id' => $station->state_id,
        'district_id' => $station->district_id,
        'city_id' => $station->city_id,
        'station_code' => 'MAS',
        'station_name' => 'Chennai Central Renamed',
        'address' => $station->address,
        'latitude' => $station->latitude,
        'longitude' => $station->longitude,
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors();
    expect($station->refresh()->station_name)->toBe('Chennai Central Renamed');
});
