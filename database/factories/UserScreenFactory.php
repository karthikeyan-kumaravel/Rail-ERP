<?php

namespace Database\Factories;

use App\Models\UserScreen;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserScreen>
 */
class UserScreenFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'screen_name' => fake()->unique()->words(2, true),
            'folder_name' => fake()->unique()->slug(2),
            'order_no' => fake()->numberBetween(1, 100),
            'icon' => fake()->randomElement(UserScreen::ICONS),
            'description' => fake()->sentence(),
            'status' => true,
        ];
    }
}
