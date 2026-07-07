<?php

namespace Database\Seeders;

use App\Models\UserType;
use Illuminate\Database\Seeder;

class UserTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Accounts Team', 'Operation Team', 'Stores Team', 'Service Engineer'] as $name) {
            UserType::query()->firstOrCreate(['name' => $name]);
        }
    }
}
