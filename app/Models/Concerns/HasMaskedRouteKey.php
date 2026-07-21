<?php

namespace App\Models\Concerns;

use App\Support\MaskedIdentifier;
use Illuminate\Database\Eloquent\Model;

/**
 * Masks route identifiers for resource URLs while preserving Eloquent route model binding.
 *
 * @mixin Model
 */
trait HasMaskedRouteKey
{
    public function getRouteKeyName(): string
    {
        return 'unique_id';
    }

    public function getRouteKey(): string
    {
        $field = $this->getRouteKeyName();
        $value = $this->getRawOriginal($field);

        if ($value === null) {
            $value = $this->attributes[$field] ?? null;
        }

        return $this->maskRouteValue($value);
    }

    public function getUniqueIdAttribute(mixed $value): string
    {
        return $this->maskRouteValue($value);
    }

    protected function maskRouteValue(mixed $value): string
    {
        if (! is_scalar($value) || (string) $value === '') {
            return '';
        }

        return MaskedIdentifier::encode((string) $value);
    }

    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        $field ??= $this->getRouteKeyName();
        $decoded = MaskedIdentifier::decode((string) $value);

        if ($decoded === null) {
            return $query->where($field, '')->whereRaw('0 = 1');
        }

        return $query->where($field, $decoded);
    }
}
