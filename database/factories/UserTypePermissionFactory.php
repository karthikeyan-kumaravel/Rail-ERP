<?php

namespace Database\Factories;

use App\Models\UserScreen;
use App\Models\UserType;
use App\Models\UserTypePermission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserTypePermission>
 */
class UserTypePermissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_type_id' => UserType::factory(),
            'user_screen_id' => UserScreen::factory(),
            'can_view' => false,
            'can_add' => false,
            'can_update' => false,
            'can_delete' => false,
            'is_delete' => false,
        ];
    }
}
