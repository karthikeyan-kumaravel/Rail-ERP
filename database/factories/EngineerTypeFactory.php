<?php

namespace Database\Factories;

use App\Models\EngineerType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EngineerType>
 */
class EngineerTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->jobTitle(),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
