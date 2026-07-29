<?php

namespace Database\Factories;

use App\Models\Loa;
use App\Models\LoaItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LoaItem>
 */
class LoaItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->randomFloat(3, 1, 100);
        $unitRate = fake()->randomFloat(2, 500, 500000);
        $escalation = fake()->optional()->randomFloat(2, 0, 15);
        $bidRate = round($unitRate * fake()->randomFloat(4, 0.9, 1.1), 2);
        $advertisedValue = round(
            ($quantity * $unitRate) + (($quantity * $unitRate) / 100) * ($escalation ?? 0),
            2,
        );
        $bidAmount = round($quantity * $bidRate, 2);
        $bidPercentageValue = $advertisedValue > 0
            ? round(abs((($bidAmount - $advertisedValue) / $advertisedValue) * 100), 4)
            : 0;

        return [
            'loa_id' => Loa::factory(),
            'schedule_name' => fake()->optional()->randomElement([
                'Schedule A - Non-SOR Items',
                'Schedule B - SOR Items',
                'Schedule C - Installation and Commissioning',
            ]),
            'schedule_advertised_value' => fake()->optional()->randomFloat(2, 1000000, 100000000),
            'item_no' => str_pad((string) fake()->numberBetween(1, 999), 2, '0', STR_PAD_LEFT),
            'item_description' => fake()->randomElement([
                'Supply, installation, testing and commissioning of IP-PBX server with all required software and accessories.',
                'Supply and installation of optical fibre cable complete with jointing, termination and testing.',
                'Provision of station communication equipment including configuration, integration and commissioning.',
            ]),
            'item_category' => fake()->optional()->randomElement([
                'Supply',
                'Supply & Installation',
                'Commissioning',
            ]),
            'item_code' => fake()->optional()->bothify('NS ##'),
            'item_quantity' => $quantity,
            'quantity_unit' => fake()->randomElement(['Numbers', 'Metres', 'Sets', 'Lots']),
            'unit_rate' => $unitRate,
            'escalation' => $escalation,
            'advertised_value' => $advertisedValue,
            'bid_rate' => $bidRate,
            'bid_rate_unit' => fake()->optional()->randomElement(['% Above', '% Below']),
            'bid_percentage_value' => $bidPercentageValue,
            'bid_amount' => $bidAmount,
            'inspection_by' => fake()->optional()->randomElement(['RITES', 'RDSO', 'Consignee']),
            'payment_stages' => fake()->optional()->randomElement([
                ['Supply' => '90%', 'Supply & Installation' => '5%', 'Commissioning' => '5%'],
                ['Supply' => '70%', 'Supply & Installation' => '20%', 'Commissioning' => '5%', 'Final Payment' => '5%'],
            ]),
            'order_no' => 0,
        ];
    }
}
