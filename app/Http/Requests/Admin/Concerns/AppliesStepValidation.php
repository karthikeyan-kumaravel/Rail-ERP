<?php

namespace App\Http\Requests\Admin\Concerns;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Lets a multi-tab wizard form (Engineer Master, LOA) save progress tab by
 * tab: the frontend posts the *entire* form on every "Save & Continue" click
 * along with `current_step` (the tab key) and `finish` (whether this is the
 * final "Finish" submit). While `finish` is false, only the current step's
 * own fields keep their `required` rule — every other field is demoted to
 * `nullable` so a still-incomplete record can be persisted. Once `finish` is
 * true (or the flag is absent, e.g. existing tests hitting the endpoint
 * directly), the full rule set applies exactly as before.
 *
 * @mixin FormRequest
 */
trait AppliesStepValidation
{
    /**
     * @param  array<string, mixed>  $rules
     * @param  array<string, list<string>>  $fieldsByStep
     * @return array<string, mixed>
     */
    protected function scopeRulesToStep(array $rules, array $fieldsByStep): array
    {
        if ($this->boolean('finish', true)) {
            return $rules;
        }

        $currentStep = $this->string('current_step')->toString();
        $stepFields = $fieldsByStep[$currentStep] ?? [];

        foreach ($rules as $field => $fieldRules) {
            if (in_array($field, $stepFields, true)) {
                continue;
            }

            $fieldRules = is_array($fieldRules) ? $fieldRules : [$fieldRules];
            $fieldRules = array_values(array_filter($fieldRules, fn ($rule) => $rule !== 'required'));

            if (! in_array('nullable', $fieldRules, true)) {
                array_unshift($fieldRules, 'nullable');
            }

            $rules[$field] = $fieldRules;
        }

        return $rules;
    }
}
