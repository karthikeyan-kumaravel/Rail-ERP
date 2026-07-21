<?php

namespace App\Repositories\Settings;

use App\Models\City;
use App\Models\Customer;
use App\Models\District;
use App\Models\Division;
use App\Models\Loa;
use App\Models\ScheduleName;
use App\Models\State;
use App\Models\Vendor;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Model;

class SettingsImportRepository
{
    public function findState(string $name): ?State
    {
        /** @var State|null $state */
        $state = State::query()
            ->where('is_delete', false)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        return $state;
    }

    public function findDistrict(string $name, int $stateId): ?District
    {
        /** @var District|null $district */
        $district = District::query()
            ->where('is_delete', false)
            ->where('state_id', $stateId)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        return $district;
    }

    public function findCity(string $name, int $districtId): ?City
    {
        /** @var City|null $city */
        $city = City::query()
            ->where('is_delete', false)
            ->where('district_id', $districtId)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        return $city;
    }

    public function findZone(string $name): ?Zone
    {
        /** @var Zone|null $zone */
        $zone = Zone::query()
            ->where('is_delete', false)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        return $zone;
    }

    public function findDivision(string $name, int $zoneId): ?Division
    {
        /** @var Division|null $division */
        $division = Division::query()
            ->where('is_delete', false)
            ->where('zone_id', $zoneId)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        return $division;
    }

    public function findScheduleName(string $name): ?ScheduleName
    {
        /** @var ScheduleName|null $scheduleName */
        $scheduleName = ScheduleName::query()
            ->where('is_delete', false)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        return $scheduleName;
    }

    public function findCustomer(string $name): ?Customer
    {
        /** @var Customer|null $customer */
        $customer = Customer::query()
            ->where('is_delete', false)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->first();

        return $customer;
    }

    public function findLoa(string $loaNumber): ?Loa
    {
        /** @var Loa|null $loa */
        $loa = Loa::query()
            ->where('is_delete', false)
            ->whereRaw('LOWER(loa_number) = ?', [mb_strtolower($loaNumber)])
            ->first();

        return $loa;
    }

    /**
     * @param  class-string<Model>  $modelClass
     * @param  array<string, mixed>  $attributes
     */
    public function create(string $modelClass, array $attributes): Model
    {
        return $modelClass::query()->create($attributes);
    }

    /**
     * @param  class-string<Model>  $modelClass
     * @param  array<string, mixed>  $conditions
     */
    public function exists(string $modelClass, array $conditions): bool
    {
        $query = $modelClass::query()->where('is_delete', false);

        foreach ($conditions as $column => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            if (is_string($value)) {
                $query->whereRaw("LOWER({$column}) = ?", [mb_strtolower($value)]);
            } else {
                $query->where($column, $value);
            }
        }

        return $query->exists();
    }

    public function customerDuplicateExists(string $name, string $contactNumber): bool
    {
        return Customer::query()
            ->where('is_delete', false)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->where('contact_number', $contactNumber)
            ->exists();
    }

    public function customerEmailExists(string $email): bool
    {
        return Customer::query()
            ->where('is_delete', false)
            ->whereRaw('LOWER(email) = ?', [mb_strtolower($email)])
            ->exists();
    }

    public function vendorDuplicateExists(string $companyName, string $contactNo): bool
    {
        return Vendor::query()
            ->where('is_delete', false)
            ->whereRaw('LOWER(company_name) = ?', [mb_strtolower($companyName)])
            ->where('contact_no', $contactNo)
            ->exists();
    }

    public function vendorPanExists(string $panNo): bool
    {
        return Vendor::query()
            ->where('is_delete', false)
            ->whereRaw('LOWER(pan_no) = ?', [mb_strtolower($panNo)])
            ->exists();
    }

    public function vendorUsernameExists(string $username): bool
    {
        return Vendor::query()
            ->whereRaw('LOWER(username) = ?', [mb_strtolower($username)])
            ->exists();
    }
}
