<?php

namespace App\Models;

use Database\Factories\LoaStationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $loa_id
 * @property int $station_id
 * @property int $order_no
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Loa $loa
 * @property-read Station $station
 */
#[Fillable(['loa_id', 'station_id', 'order_no'])]
class LoaStation extends Model
{
    /** @use HasFactory<LoaStationFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Loa, $this>
     */
    public function loa(): BelongsTo
    {
        return $this->belongsTo(Loa::class);
    }

    /**
     * @return BelongsTo<Station, $this>
     */
    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }
}
