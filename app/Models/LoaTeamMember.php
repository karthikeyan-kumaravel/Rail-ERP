<?php

namespace App\Models;

use Database\Factories\LoaTeamMemberFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $loa_id
 * @property string $name
 * @property string $role
 * @property int $order_no
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Loa $loa
 */
#[Fillable(['loa_id', 'name', 'role', 'order_no'])]
class LoaTeamMember extends Model
{
    /** @use HasFactory<LoaTeamMemberFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Loa, $this>
     */
    public function loa(): BelongsTo
    {
        return $this->belongsTo(Loa::class);
    }
}
