<?php

namespace App\Models;

use App\Models\Concerns\HasMaskedRouteKey;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $module
 * @property string|null $file_name
 * @property string $status
 * @property int $total_records
 * @property int $success_count
 * @property int $failed_count
 * @property int $duplicate_count
 * @property int|null $imported_by
 * @property array<int|string, mixed>|null $summary
 * @property array<int|string, mixed>|null $errors
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $importedBy
 */
#[Fillable([
    'module',
    'file_name',
    'status',
    'total_records',
    'success_count',
    'failed_count',
    'duplicate_count',
    'imported_by',
    'summary',
    'errors',
    'completed_at',
])]
class ImportLog extends Model
{
    use HasFactory, HasMaskedRouteKey;

    public function getRouteKeyName(): string
    {
        return 'id';
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'summary' => 'array',
            'errors' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function importedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }
}
