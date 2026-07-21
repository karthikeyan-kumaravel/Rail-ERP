<?php

use App\Models\City;
use App\Models\District;
use App\Models\State;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

function validCityPayload(int $stateId, int $districtId, array $overrides = []): array
{
    return array_merge([
        'state_id' => $stateId,
        'district_id' => $districtId,
        'name' => 'Coimbatore',
        'city_code' => 'CBE',
        'pincode' => '641001',
        'active_status' => '1',
    ], $overrides);
}

test('a city can be created under a state and district', function () {
    $state = State::factory()->create();
    $district = District::factory()->create(['state_id' => $state->id]);

    $response = $this->post('/admin/cities', validCityPayload($state->id, $district->id));

    $response->assertRedirect('/admin/cities');

    $city = City::query()->where('name', 'Coimbatore')->firstOrFail();

    expect($city->state_id)->toBe($state->id)
        ->and($city->district_id)->toBe($district->id)
        ->and($city->city_code)->toBe('CBE')
        ->and($city->pincode)->toBe('641001')
        ->and($city->active_status)->toBeTrue()
        ->and($city->is_delete)->toBeFalse()
        ->and($city->unique_id)->not->toBeNull();
});

test('a district that does not belong to the selected state is rejected', function () {
    $state = State::factory()->create();
    $otherState = State::factory()->create();
    $district = District::factory()->create(['state_id' => $otherState->id]);

    $response = $this->post('/admin/cities', validCityPayload($state->id, $district->id));

    $response->assertSessionHasErrors('district_id');
});

test('a pincode that is not exactly 6 digits is rejected', function () {
    $state = State::factory()->create();
    $district = District::factory()->create(['state_id' => $state->id]);

    $response = $this->post('/admin/cities', validCityPayload($state->id, $district->id, [
        'pincode' => '12345',
    ]));

    $response->assertSessionHasErrors('pincode');
});

test('a city name cannot be duplicated within the same district', function () {
    $state = State::factory()->create();
    $district = District::factory()->create(['state_id' => $state->id]);
    City::factory()->create(['state_id' => $state->id, 'district_id' => $district->id, 'name' => 'Salem']);

    $response = $this->post('/admin/cities', validCityPayload($state->id, $district->id, [
        'name' => 'Salem',
    ]));

    $response->assertSessionHasErrors('name');
});

test('the same city name may be used in a different district', function () {
    $state = State::factory()->create();
    $firstDistrict = District::factory()->create(['state_id' => $state->id]);
    $secondDistrict = District::factory()->create(['state_id' => $state->id]);
    City::factory()->create(['state_id' => $state->id, 'district_id' => $firstDistrict->id, 'name' => 'Salem']);

    $response = $this->post('/admin/cities', validCityPayload($state->id, $secondDistrict->id, [
        'name' => 'Salem',
    ]));

    $response->assertSessionDoesntHaveErrors('name');
});

test('a city is soft deleted', function () {
    $city = City::factory()->create();

    $this->delete("/admin/cities/{$city->unique_id}");

    expect($city->refresh()->is_delete)->toBeTrue();

    $this->assertDatabaseHas('cities', [
        'id' => $city->id,
    ]);
});

test('a city keeps its own name when updated', function () {
    $state = State::factory()->create();
    $district = District::factory()->create(['state_id' => $state->id]);
    $city = City::factory()->create(['state_id' => $state->id, 'district_id' => $district->id, 'name' => 'Erode']);

    $response = $this->put("/admin/cities/{$city->unique_id}", validCityPayload($state->id, $district->id, [
        'name' => 'Erode',
    ]));

    $response->assertSessionDoesntHaveErrors('name');
    expect($city->refresh()->name)->toBe('Erode');
});

test('an invalid district is rejected', function () {
    $state = State::factory()->create();

    $response = $this->post('/admin/cities', validCityPayload($state->id, 999999, [
        'name' => 'Nowhere',
    ]));

    $response->assertSessionHasErrors('district_id');
});
