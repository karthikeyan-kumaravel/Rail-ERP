<?php

namespace Database\Factories;

use App\Models\District;
use App\Models\State;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<District>
 */
class DistrictFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'state_id' => State::factory(),
            'name' => fake()->unique()->city(),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
