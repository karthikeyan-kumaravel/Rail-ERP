<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Stamps unique_id, acc_year, and the sess_* audit columns that mirror the
 * legacy ERP schema's session-tracking convention.
 *
 * @mixin Model
 */
trait HasAuditSessionFields
{
    protected static function bootHasAuditSessionFields(): void
    {
        static::creating(function (Model $model): void {
            // A plain `??=` breaks here: models using HasMaskedRouteKey define a
            // getUniqueIdAttribute() accessor, and Eloquent's isset() treats the
            // mere presence of a get-mutator as "the attribute is set" even when
            // the underlying column is still null — so `??=` would never fire.
            // Reading the raw attributes array sidesteps the accessor entirely.
            if (blank($model->getAttributes()['unique_id'] ?? null)) {
                $model->unique_id = (string) Str::uuid();
            }

            $model->acc_year ??= static::currentAccYear();
            $model->created = Carbon::now();
            $model->updated = Carbon::now();
            static::stampSession($model);
        });

        static::updating(function (Model $model): void {
            $model->updated = Carbon::now();
            static::stampSession($model);
        });
    }

    protected static function stampSession(Model $model): void
    {
        $model->session_id = request()?->hasSession() ? request()->session()->getId() : null;
        $model->sess_user_id = auth()->id();
        $model->sess_user_type = auth()->user()?->user_type_id;
    }

    protected static function currentAccYear(): string
    {
        $now = Carbon::now();
        $startYear = $now->month >= 4 ? $now->year : $now->year - 1;

        return "{$startYear}-".($startYear + 1);
    }
}
