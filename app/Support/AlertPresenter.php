<?php

namespace App\Support;

use App\Models\Alert;
use App\Models\Loa;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Date;

/**
 * Shapes an Alert into the array the frontend alert-card component expects
 * (days-remaining/late label, and a link to the underlying record) — shared
 * between the Dashboard banner and the full Alerts & Reminders index page.
 */
final class AlertPresenter
{
    /**
     * @return array{id: int, type: string, severity: string, title: string, description: string, due_date: string|null, days_label: string, link_label: string, link_url: string|null}
     */
    public static function present(Alert $alert): array
    {
        return [
            'id' => $alert->id,
            'type' => $alert->type,
            'severity' => $alert->severity,
            'title' => $alert->title,
            'description' => $alert->description,
            'due_date' => $alert->due_date?->format('d M Y'),
            'days_label' => self::daysLabel($alert->due_date),
            'link_label' => self::linkLabel($alert->type),
            'link_url' => self::linkUrl($alert),
        ];
    }

    private static function daysLabel(?CarbonInterface $dueDate): string
    {
        if (! $dueDate) {
            return '—';
        }

        $days = (int) Date::now()->startOfDay()->diffInDays($dueDate, false);

        if ($days < 0) {
            return abs($days).' DAYS LATE';
        }

        if ($days === 0) {
            return 'DUE TODAY';
        }

        return "{$days} DAYS LEFT";
    }

    private static function linkLabel(string $type): string
    {
        return match ($type) {
            Alert::TYPE_LOA_COMPLETION_APPROACHING => 'LOA',
            default => 'View',
        };
    }

    private static function linkUrl(Alert $alert): ?string
    {
        if ($alert->type === Alert::TYPE_LOA_COMPLETION_APPROACHING && $alert->alertable instanceof Loa) {
            return route('admin.loas.show', $alert->alertable);
        }

        return null;
    }
}
