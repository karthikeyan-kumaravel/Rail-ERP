<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\District;
use App\Models\State;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<City>
 */
class CityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $state = State::factory()->create();

        return [
            'state_id' => $state->id,
            'district_id' => District::factory()->create(['state_id' => $state->id])->id,
            'name' => fake()->unique()->city(),
            'city_code' => fake()->unique()->lexify('???'),
            'pincode' => fake()->numerify('######'),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
