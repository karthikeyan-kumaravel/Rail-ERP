<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\District;
use App\Models\State;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
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
            'name' => fake()->company(),
            'billing_address' => fake()->address(),
            'pin_code' => fake()->numerify('######'),
            'state_id' => $state->id,
            'district_id' => District::factory()->create(['state_id' => $state->id])->id,
            'zone' => fake()->city(),
            'contact_name' => fake()->name(),
            'contact_number' => fake()->numerify('##########'),
            'contact_landline_number' => fake()->optional()->numerify('0471#######'),
            'email' => fake()->optional()->safeEmail(),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
