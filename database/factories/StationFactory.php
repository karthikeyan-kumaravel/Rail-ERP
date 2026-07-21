<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\District;
use App\Models\Division;
use App\Models\State;
use App\Models\Station;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Station>
 */
class StationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $zone = Zone::factory()->create();
        $state = State::factory()->create();
        $district = District::factory()->create(['state_id' => $state->id]);
        $city = City::factory()->create(['state_id' => $state->id, 'district_id' => $district->id]);

        return [
            'zone_id' => $zone->id,
            'division_id' => Division::factory()->create(['zone_id' => $zone->id])->id,
            'station_code' => strtoupper(fake()->unique()->bothify('STN-###')),
            'station_name' => fake()->unique()->city().' Station',
            'state_id' => $state->id,
            'district_id' => $district->id,
            'city_id' => $city->id,
            'address' => fake()->address(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
