<?php

namespace Database\Factories;

use App\Models\LoaTeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoaTeamMember>
 */
class LoaTeamMemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'role' => fake()->randomElement([
                'Project Manager',
                'Site Engineer',
                'Billing Engineer',
                'Quality Engineer',
                'Safety Officer',
            ]),
            'order_no' => 0,
        ];
    }
}
