<?php

namespace Database\Factories;

use App\Models\Division;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Division>
 */
class DivisionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'zone_id' => Zone::factory(),
            'name' => fake()->unique()->city().' Division',
            'code' => strtoupper(fake()->unique()->lexify('???')),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
