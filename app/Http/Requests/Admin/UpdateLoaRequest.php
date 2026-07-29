<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\AppliesStepValidation;
use App\Models\Loa;
use App\Models\LoaFinancialSecurity;
use App\Support\LoaFormSteps;
use App\Support\PaymentStages;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class UpdateLoaRequest extends FormRequest
{
    use AppliesStepValidation;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'loa_date' => $this->filled('loa_date') ? $this->input('loa_date') : null,
            'completion_date' => $this->filled('completion_date') ? $this->input('completion_date') : null,
            'extension_date' => $this->filled('extension_date') ? $this->input('extension_date') : null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->scopeRulesToStep($this->baseRules(), LoaFormSteps::FIELDS_BY_TAB);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    private function baseRules(): array
    {
        $loa = $this->route('loa');
        $loaId = $loa instanceof Loa ? $loa->id : null;

        return [
            'loa_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('loas', 'loa_number')
                    ->where(fn ($query) => $query->where('is_delete', false))
                    ->ignore($loaId),
            ],
            'loa_date' => ['nullable', 'date'],
            'client' => ['required', 'string', 'max:255'],
            'vendor_id' => [
                'nullable',
                Rule::exists('vendors', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'division_id' => [
                'required',
                Rule::exists('divisions', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'schedule_name_id' => [
                'nullable',
                Rule::exists('schedule_names', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'schedule_type_id' => [
                'nullable',
                Rule::exists('schedule_types', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'work_type' => ['required', 'string', 'max:255'],
            'contract_value_amount' => ['required', 'numeric', 'min:0'],
            'contract_value_unit' => ['required', 'in:Cr,L'],
            'completion_period_months' => ['required', 'integer', 'min:0'],
            'defect_liability_months' => ['required', 'integer', 'min:0'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'total_stations' => ['required', 'integer', 'min:0'],
            'completion_date' => ['nullable', 'date'],
            'extension_date' => ['nullable', 'date'],
            'scope_of_work' => ['required', 'string'],
            'active_status' => ['required', 'in:0,1'],
            'team' => ['required', 'array', 'min:1'],
            'team.*.engineer_id' => [
                'required',
                'integer',
                Rule::exists('engineers', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'team.*.engineer_type_id' => [
                'required',
                'integer',
                Rule::exists('engineer_types', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'team.*.name' => ['required', 'string', 'max:255'],
            'team.*.role' => ['required', 'string', 'max:100'],
            'items' => ['sometimes', 'array'],
            'items.*.schedule_name_id' => [
                'nullable',
                Rule::exists('schedule_names', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'items.*.schedule_type_id' => [
                'nullable',
                Rule::exists('schedule_types', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'items.*.schedule_name' => ['nullable', 'string'],
            'items.*.schedule_advertised_value' => ['nullable', 'numeric', 'min:0'],
            'items.*.item_no' => ['required', 'string', 'max:50'],
            'items.*.item_description' => ['required', 'string'],
            'items.*.item_category' => ['nullable', Rule::in(['Supply', 'Supply & Installation', 'Commissioning'])],
            'items.*.specialization_file' => ['nullable', 'file', 'max:10240'],
            'items.*.remove_specialization_file' => ['boolean'],
            'items.*.item_code' => ['nullable', 'string', 'max:100'],
            'items.*.item_quantity' => ['required', 'numeric', 'min:0'],
            'items.*.quantity_unit' => ['required', 'string', 'max:100'],
            'items.*.unit_rate' => ['required', 'numeric', 'min:0'],
            'items.*.escalation' => ['nullable', 'numeric', 'min:0'],
            'items.*.advertised_value' => ['required', 'numeric', 'min:0'],
            'items.*.bid_rate' => ['required', 'numeric', 'min:0'],
            'items.*.bid_rate_unit' => ['nullable', Rule::in(['% Above', '% Below'])],
            'items.*.bid_percentage_value' => ['nullable', 'numeric', 'min:0'],
            'items.*.bid_amount' => ['required', 'numeric', 'min:0'],
            'items.*.rebate_enabled' => ['nullable', 'boolean'],
            'items.*.rebate_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.rebate_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.final_bid_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.inspection_by' => ['nullable', Rule::in(['RITES', 'RDSO', 'Consignee'])],
            'items.*.payment_stages' => ['nullable', 'array'],
            'items.*.payment_stages.*' => [Rule::in(PaymentStages::PERCENTAGES)],
            'stations' => ['sometimes', 'array'],
            'stations.*.station_id' => [
                'nullable',
                Rule::exists('stations', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'financial_securities' => ['required', 'array'],
            ...$this->financialSecurityRules(LoaFinancialSecurity::TYPE_EMD),
            ...$this->financialSecurityRules(LoaFinancialSecurity::TYPE_PERFORMANCE_BG, required: false),
            ...$this->financialSecurityRules(LoaFinancialSecurity::TYPE_SECURITY_BG, required: false),
        ];
    }

    /**
     * The validation rules shared by the EMD, Performance BG, and Security BG
     * sections of the Financial Security tab — identical shape per type, so
     * this is generated once per type rather than copy-pasted three times.
     * Performance BG and Security BG are optional, so their fields are
     * validated as `nullable` rather than `required`.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    private function financialSecurityRules(string $type, bool $required = true): array
    {
        $presence = $required ? 'required' : 'nullable';

        return [
            "financial_securities.{$type}.amount" => [
                $presence,
                'numeric',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if ((float) $value <= 0) {
                        $fail('The amount must be greater than zero.');
                    }
                },
            ],
            "financial_securities.{$type}.amount_unit" => [$presence, 'in:Cr,L'],
            "financial_securities.{$type}.validity_start_date" => [$presence, 'date'],
            "financial_securities.{$type}.validity_end_date" => [
                $presence,
                'date',
                "after_or_equal:financial_securities.{$type}.validity_start_date",
            ],
            "financial_securities.{$type}.claim_period" => [$presence, 'integer', 'min:1'],
            "financial_securities.{$type}.claim_period_unit" => [$presence, 'in:Days,Months'],
            "financial_securities.{$type}.bank_id" => [
                $presence,
                Rule::exists('banks', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            "financial_securities.{$type}.file" => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:5120'],
            "financial_securities.{$type}.remove_file" => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'end_date.after_or_equal' => 'The end date must be on or after the start date.',
            'financial_securities.emd.validity_end_date.after_or_equal' => 'The end date must be on or after the start date.',
            'financial_securities.performance_bg.validity_end_date.after_or_equal' => 'The end date must be on or after the start date.',
            'financial_securities.security_bg.validity_end_date.after_or_equal' => 'The end date must be on or after the start date.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $finishing = $this->boolean('finish', true);
        $currentStep = $this->string('current_step')->toString();

        if ($finishing || $currentStep === 'items') {
            $validator->after(function (Validator $validator) {
                PaymentStages::validateItems($this->input('items', []), $validator);
            });
        }
    }

    /**
     * Logs which field(s)/rule(s) rejected the request before the usual
     * redirect-back-with-errors response — the wizard posts the entire form
     * on every step, so without this it's not obvious from the response
     * alone whether a failure came from the current step or a stale field
     * belonging to a different tab.
     */
    protected function failedValidation(Validator $validator): void
    {
        $loa = $this->route('loa');

        Log::debug('LOA update request failed validation', [
            'loa_id' => $loa instanceof Loa ? $loa->id : null,
            'current_step' => $this->string('current_step')->toString(),
            'finish' => $this->boolean('finish', true),
            'errors' => $validator->errors()->toArray(),
        ]);

        parent::failedValidation($validator);
    }
}
