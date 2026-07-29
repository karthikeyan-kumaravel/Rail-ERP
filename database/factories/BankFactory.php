<?php

namespace Database\Factories;

use App\Models\Bank;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bank>
 */
class BankFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company().' Bank',
            'branch_name' => fake()->city(),
            'ifsc_code' => strtoupper(fake()->bothify('????0######')),
            'account_number' => fake()->unique()->numerify('##################'),
            'account_holder_name' => fake()->name(),
            'account_type' => fake()->randomElement(['Savings', 'Current']),
            'bank_address' => fake()->address(),
            'pincode' => fake()->numerify('######'),
            'contact_number' => fake()->numerify('##########'),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
