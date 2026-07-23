<?php

namespace Database\Factories;

use App\Models\Alert;
use App\Models\Loa;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Alert>
 */
class AlertFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dueDate = fake()->dateTimeBetween('now', '+30 days');

        return [
            'type' => Alert::TYPE_LOA_COMPLETION_APPROACHING,
            'severity' => Alert::SEVERITY_WARNING,
            'title' => 'LOA Completion Approaching',
            'description' => fake()->sentence(),
            'alertable_type' => Loa::class,
            'alertable_id' => Loa::factory(),
            'due_date' => $dueDate->format('Y-m-d'),
            'is_delete' => false,
        ];
    }
}
