<?php

namespace Database\Factories;

use App\Models\Division;
use App\Models\Loa;
use App\Models\LoaTeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\Sequence;

/**
 * @extends Factory<Loa>
 */
class LoaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'division_id' => Division::factory(),
            'loa_number' => 'RAILWAY/'.strtoupper(fake()->unique()->lexify('???')).'/'.fake()->year().'/'.fake()->unique()->numerify('###'),
            'client' => fake()->company().' Railway',
            'work_type' => fake()->sentence(3),
            'contract_value_amount' => fake()->randomFloat(2, 10, 500),
            'contract_value_unit' => 'Cr',
            'completion_period_months' => fake()->numberBetween(6, 36),
            'defect_liability_months' => fake()->numberBetween(6, 24),
            'start_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'end_date' => fake()->dateTimeBetween('now', '+2 years')->format('Y-m-d'),
            'total_stations' => fake()->numberBetween(1, 50),
            'scope_of_work' => fake()->paragraph(),
            'active_status' => true,
            'is_delete' => false,
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Loa $loa) {
            LoaTeamMember::factory()
                ->count(3)
                ->sequence(fn (Sequence $sequence) => ['order_no' => $sequence->index])
                ->create(['loa_id' => $loa->id]);
        });
    }
}
