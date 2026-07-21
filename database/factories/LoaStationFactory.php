<?php

namespace Database\Factories;

use App\Models\LoaStation;
use App\Models\Station;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoaStation>
 */
class LoaStationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'station_id' => Station::factory(),
            'order_no' => 0,
        ];
    }
}
