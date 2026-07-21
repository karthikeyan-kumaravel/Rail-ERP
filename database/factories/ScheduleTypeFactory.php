<?php

namespace Database\Factories;

use App\Models\ScheduleName;
use App\Models\ScheduleType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ScheduleType>
 */
class ScheduleTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'schedule_name_id' => ScheduleName::factory(),
            'name' => fake()->unique()->word(),
            'short_name' => strtoupper(fake()->unique()->lexify('???')),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
