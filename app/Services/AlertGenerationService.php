<?php

namespace App\Services;

use App\Models\Alert;
use App\Models\Loa;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Date;

/**
 * Regenerates system alerts driven purely by dates. Currently only wires up
 * "LOA Completion Approaching" (30 days before Loa::completion_date); other
 * alert types can plug into the same alerts table/model later.
 */
class AlertGenerationService
{
    private const LOA_COMPLETION_WINDOW_DAYS = 30;

    /**
     * Full sweep across every LOA — used by the nightly scheduled command.
     */
    public function syncLoaCompletionAlerts(): void
    {
        $qualifyingLoas = $this->qualifyingLoaCompletionQuery()->get();

        foreach ($qualifyingLoas as $loa) {
            $this->upsertLoaCompletionAlert($loa);
        }

        Alert::query()
            ->where('type', Alert::TYPE_LOA_COMPLETION_APPROACHING)
            ->where('alertable_type', Loa::class)
            ->where('is_delete', false)
            ->whereNotIn('alertable_id', $qualifyingLoas->pluck('id'))
            ->update(['is_delete' => true]);
    }

    /**
     * Single-LOA sync — called immediately after a LOA is created/updated/
     * soft-deleted so its alert reflects the new completion_date right away,
     * rather than waiting for the nightly sweep.
     */
    public function syncLoaCompletionAlertForLoa(Loa $loa): void
    {
        if ($this->loaQualifiesForCompletionAlert($loa)) {
            $this->upsertLoaCompletionAlert($loa);

            return;
        }

        Alert::query()
            ->where('type', Alert::TYPE_LOA_COMPLETION_APPROACHING)
            ->where('alertable_type', Loa::class)
            ->where('alertable_id', $loa->id)
            ->where('is_delete', false)
            ->update(['is_delete' => true]);
    }

    /**
     * @return Builder<Loa>
     */
    private function qualifyingLoaCompletionQuery(): Builder
    {
        return Loa::query()
            ->where('is_delete', false)
            ->whereNotNull('completion_date')
            ->whereDate('completion_date', '>=', Date::now()->toDateString())
            ->whereDate('completion_date', '<=', Date::now()->addDays(self::LOA_COMPLETION_WINDOW_DAYS)->toDateString());
    }

    private function loaQualifiesForCompletionAlert(Loa $loa): bool
    {
        if ($loa->is_delete || ! $loa->completion_date) {
            return false;
        }

        $daysRemaining = Date::now()->startOfDay()->diffInDays($loa->completion_date, false);

        return $daysRemaining >= 0 && $daysRemaining <= self::LOA_COMPLETION_WINDOW_DAYS;
    }

    private function upsertLoaCompletionAlert(Loa $loa): void
    {
        $daysRemaining = (int) Date::now()->startOfDay()->diffInDays($loa->completion_date, false);

        Alert::query()->updateOrCreate(
            [
                'type' => Alert::TYPE_LOA_COMPLETION_APPROACHING,
                'alertable_type' => Loa::class,
                'alertable_id' => $loa->id,
            ],
            [
                'severity' => $daysRemaining <= 7 ? Alert::SEVERITY_CRITICAL : Alert::SEVERITY_WARNING,
                'title' => "Upcoming Completion: {$loa->loa_number}",
                'description' => "{$loa->client} — completion date {$loa->completion_date->format('d M Y')}, {$daysRemaining} days remaining",
                'due_date' => $loa->completion_date,
                'is_delete' => false,
            ],
        );
    }
}
