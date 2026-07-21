<?php

namespace Database\Factories;

use App\Models\ScheduleName;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ScheduleName>
 */
class ScheduleNameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
