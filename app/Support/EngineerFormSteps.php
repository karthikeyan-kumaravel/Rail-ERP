<?php

namespace App\Support;

/**
 * The Engineer Master create/edit form's tab order and the fields that
 * belong to each tab, mirrored from resources/js/pages/admin/engineers/
 * (engineer-tabs.tsx / engineer-form-fields.tsx). Used to scope validation
 * to the current step during a "Save & Continue" wizard flow and to work
 * out which tab to resume on after each step is saved.
 */
final class EngineerFormSteps
{
    /**
     * @var array<int, string>
     */
    public const array TAB_ORDER = [
        'personal',
        'contact',
        'identity',
        'employment',
        'banking',
        'statutory',
        'additional',
    ];

    /**
     * @var array<string, list<string>>
     */
    public const array FIELDS_BY_TAB = [
        'personal' => ['full_name', 'gender', 'date_of_birth'],
        'contact' => [
            'mobile_number',
            'official_email',
            'current_address',
            'permanent_address',
            'postal_code',
        ],
        'identity' => ['aadhaar_number', 'pan_number'],
        'employment' => ['date_of_joining', 'engineer_type_id'],
        'banking' => [],
        'statutory' => [],
        'additional' => [],
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
