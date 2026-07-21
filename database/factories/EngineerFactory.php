<?php

namespace Database\Factories;

use App\Models\Engineer;
use App\Models\EngineerType;
use App\Models\State;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Engineer>
 */
class EngineerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employee_code' => 'ENG-'.fake()->unique()->numerify('#####'),
            'full_name' => fake()->name(),
            'gender' => fake()->randomElement(Engineer::GENDERS),
            'date_of_birth' => fake()->dateTimeBetween('-55 years', '-20 years')->format('Y-m-d'),
            'blood_group' => fake()->randomElement(Engineer::BLOOD_GROUPS),
            'nationality' => 'Indian',
            'marital_status' => fake()->randomElement(Engineer::MARITAL_STATUSES),
            'mobile_number' => fake()->numerify('9#########'),
            'alternate_mobile_number' => fake()->optional()->numerify('8#########'),
            'official_email' => fake()->unique()->safeEmail(),
            'personal_email' => fake()->optional()->safeEmail(),
            'current_address' => fake()->address(),
            'permanent_address' => fake()->address(),
            'city_id' => null,
            'state_id' => State::factory(),
            'postal_code' => fake()->numerify('######'),
            'aadhaar_number' => fake()->unique()->numerify('############'),
            'pan_number' => strtoupper(fake()->bothify('?????####?')),
            'date_of_joining' => fake()->dateTimeBetween('-10 years', 'now')->format('Y-m-d'),
            'employee_status' => 'Active',
            'engineer_type_id' => EngineerType::factory(),
            'bank_name' => fake()->company().' Bank',
            'branch_name' => fake()->city(),
            'account_number' => fake()->numerify('##############'),
            'ifsc_code' => strtoupper(fake()->bothify('????0######')),
            'pf_account_number' => fake()->optional()->bothify('PF##########'),
            'esi_account_number' => fake()->optional()->bothify('ESI##########'),
            'languages_known' => fake()->randomElements(Engineer::LANGUAGES, 2),
            'is_delete' => false,
        ];
    }
}
