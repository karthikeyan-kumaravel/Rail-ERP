<?php

namespace Database\Factories;

use App\Models\Loa;
use App\Models\PurchaseOrder;
use App\Models\Vendor;
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
        return [
            'po_number' => 'PO/'.fake()->year().'/'.fake()->unique()->numerify('####'),
            'order_date' => fake()->dateTimeBetween('-6 months', 'now'),
            'loa_id' => Loa::factory(),
            'vendor_id' => Vendor::factory(),
            'delivery_date' => fake()->dateTimeBetween('now', '+3 months'),
            'status' => fake()->randomElement(PurchaseOrder::STATUSES),
            'payment_type' => fake()->randomElement(PurchaseOrder::PAYMENT_TYPES),
            'is_delete' => false,
        ];
    }
}
