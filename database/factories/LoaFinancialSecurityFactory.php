<?php

namespace Database\Factories;

use App\Models\Bank;
use App\Models\Loa;
use App\Models\LoaFinancialSecurity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoaFinancialSecurity>
 */
class LoaFinancialSecurityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'loa_id' => Loa::factory(),
            'security_type' => fake()->randomElement(LoaFinancialSecurity::TYPES),
            'amount' => fake()->randomFloat(2, 1, 100),
            'amount_unit' => 'L',
            'validity_start_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'validity_end_date' => fake()->dateTimeBetween('now', '+2 years')->format('Y-m-d'),
            'claim_period' => fake()->numberBetween(1, 90),
            'claim_period_unit' => 'Days',
            'bank_id' => Bank::factory(),
            'is_delete' => false,
        ];
    }
}
