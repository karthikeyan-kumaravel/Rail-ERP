<?php

namespace App\Support;

/**
 * The LOA create/edit form's tab order and the fields that belong to each
 * tab, mirrored from resources/js/pages/admin/loas/ (loa-tabs.tsx /
 * loa-form-fields.tsx). Used to scope validation to the current step during
 * a "Save & Continue" wizard flow and to work out which tab to resume on
 * after each step is saved.
 */
final class LoaFormSteps
{
    /**
     * @var array<int, string>
     */
    public const array TAB_ORDER = ['details', 'items', 'financial', 'team', 'scope'];

    /**
     * The *full* field surface each tab renders (not just its required
     * fields) — mirrors the frontend's `tabFieldPrefixes`. A field listed
     * here keeps its original rule untouched while its own tab is the
     * current step; this matters beyond just "required" because the
     * `items.*`/`stations.*` wildcard rules are conditionally required
     * (only when an entry is present) and must not be weakened just because
     * a different tab happens to be active.
     *
     * @var array<string, list<string>>
     */
    public const array FIELDS_BY_TAB = [
        'details' => [
            'loa_number',
            'client',
            'vendor_id',
            'division_id',
            'work_type',
            'contract_value_amount',
            'contract_value_unit',
            'completion_period_months',
            'defect_liability_months',
            'start_date',
            'end_date',
            'total_stations',
            'active_status',
            'stations',
            'stations.*.station_id',
        ],
        'items' => [
            'items',
            'items.*.schedule_name_id',
            'items.*.schedule_type_id',
            'items.*.schedule_name',
            'items.*.schedule_advertised_value',
            'items.*.item_no',
            'items.*.item_description',
            'items.*.item_code',
            'items.*.item_quantity',
            'items.*.quantity_unit',
            'items.*.unit_rate',
            'items.*.escalation',
            'items.*.advertised_value',
            'items.*.bid_rate',
            'items.*.bid_rate_unit',
            'items.*.bid_amount',
            'items.*.inspection_by',
            'items.*.payment_stages',
        ],
        'financial' => [
            'bg_amount',
            'bg_amount_unit',
            'bg_validity',
            'security_deposit_amount',
            'security_deposit_unit',
            'mobilization_advance_amount',
            'mobilization_advance_unit',
            'mobilization_advance_status',
        ],
        'team' => ['team', 'team.*.name', 'team.*.role'],
        'scope' => ['scope_of_work'],
    ];

    /**
     * The tab that follows $current, or null if $current is the last tab
     * (or unrecognized).
     */
    public static function nextTab(?string $current): ?string
    {
        $index = $current !== null ? array_search($current, self::TAB_ORDER, true) : false;

        if ($index === false) {
            return self::TAB_ORDER[0];
        }

        return self::TAB_ORDER[$index + 1] ?? null;
    }
}
