<?php

namespace Database\Factories;

use App\Models\District;
use App\Models\State;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
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
            'company_name' => fake()->company(),
            'name' => fake()->name(),
            'contact_no' => fake()->numerify('##########'),
            'alternate_contact_no' => fake()->optional()->numerify('##########'),
            'email' => fake()->optional()->safeEmail(),
            'gst_no' => fake()->optional()->passthrough(
                fake()->numerify('##').strtoupper(fake()->bothify('?????####?')).strtoupper(fake()->bothify('?')).'Z'.strtoupper(fake()->bothify('?')),
            ),
            'pan_no' => strtoupper(fake()->bothify('?????####?')),
            'pan_proof_path' => 'vendors/pan-proofs/sample.pdf',
            'pincode' => fake()->numerify('######'),
            'state_id' => $state->id,
            'district_id' => District::factory()->create(['state_id' => $state->id])->id,
            'zone_name' => fake()->optional()->city(),
            'bank_name' => fake()->company().' Bank',
            'branch_name' => fake()->optional()->city(),
            'account_no' => fake()->numerify('##############'),
            'ifsc_code' => strtoupper(fake()->bothify('????0######')),
            'account_holder_name' => fake()->name(),
            'bank_proof_path' => 'vendors/bank-proofs/sample.pdf',
            'address' => fake()->address(),
            'username' => fake()->unique()->userName(),
            'password' => Hash::make('password'),
            'active_status' => true,
            'is_delete' => false,
        ];
    }
}
