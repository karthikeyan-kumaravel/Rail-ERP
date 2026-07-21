<?php

namespace Database\Factories;

use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $orderDate = fake()->dateTimeBetween('-1 year', 'now');

        return [
            'po_number' => 'PO/'.fake()->year().'/'.fake()->unique()->numerify('####'),
            'supplier' => fake()->company(),
            'items_description' => fake()->sentence(),
            'order_date' => $orderDate,
            'amount' => fake()->randomFloat(2, 1000, 50000000),
            'delivery_date' => fake()->dateTimeBetween($orderDate, '+6 months'),
            'payment_terms' => fake()->randomElement(['Advance', '30 days credit', '45 days credit', '60 days credit']),
            'total_qty' => 100,
            'received_qty' => fake()->numberBetween(0, 100),
            'inspection_status' => fake()->randomElement(PurchaseOrder::INSPECTION_STATUSES),
            'dispatch_status' => fake()->randomElement(PurchaseOrder::DISPATCH_STATUSES),
            'is_delete' => false,
        ];
    }
}
