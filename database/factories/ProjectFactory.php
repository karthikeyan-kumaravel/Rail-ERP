<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Division;
use App\Models\Loa;
use App\Models\Project;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->catchPhrase(),
            'customer_id' => Customer::factory(),
            'zone_id' => Zone::factory(),
            'division_id' => Division::factory(),
            'loa_id' => Loa::factory(),
            'contract_value' => fake()->randomFloat(2, 100000, 50000000),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
