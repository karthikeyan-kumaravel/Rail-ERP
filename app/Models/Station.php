<?php

namespace App\Models;

use App\Models\Concerns\HasAuditSessionFields;
use App\Models\Concerns\HasMaskedRouteKey;
use Database\Factories\StationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $zone_id
 * @property int $division_id
 * @property int|null $state_id
 * @property int|null $district_id
 * @property int|null $city_id
 * @property string $station_code
 * @property string $station_name
 * @property string|null $address
 * @property string|null $latitude
 * @property string|null $longitude
 * @property bool $active_status
 * @property bool $is_delete
 * @property string|null $unique_id
 * @property string|null $acc_year
 * @property string|null $session_id
 * @property int|null $sess_user_type
 * @property int|null $sess_user_id
 * @property int|null $sess_company_id
 * @property int|null $sess_branch_id
 * @property Carbon|null $created
 * @property Carbon|null $updated
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Zone $zone
 * @property-read Division $division
 * @property-read State|null $state
 * @property-read District|null $district
 * @property-read City|null $city
 */
#[Fillable([
    'zone_id',
    'division_id',
    'state_id',
    'district_id',
    'city_id',
    'station_code',
    'station_name',
    'address',
    'latitude',
    'longitude',
    'active_status',
    'is_delete',
])]
class Station extends Model
{
    /** @use HasFactory<StationFactory> */
    use HasAuditSessionFields, HasFactory, HasMaskedRouteKey;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'active_status' => 'boolean',
            'is_delete' => 'boolean',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'created' => 'datetime',
            'updated' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Zone, $this>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * @return BelongsTo<Division, $this>
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    /**
     * @return BelongsTo<State, $this>
     */
    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    /**
     * @return BelongsTo<District, $this>
     */
    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    /**
     * @return BelongsTo<City, $this>
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
