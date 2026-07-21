<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\AppliesStepValidation;
use App\Models\Loa;
use App\Support\LoaFormSteps;
use App\Support\PaymentStages;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
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
            'bg_amount' => ['required', 'numeric', 'min:0'],
            'bg_amount_unit' => ['required', 'in:Cr,L'],
            'bg_validity' => ['required', 'date'],
            'security_deposit_amount' => ['required', 'numeric', 'min:0'],
            'security_deposit_unit' => ['required', 'in:Cr,L'],
            'mobilization_advance_amount' => ['required', 'numeric', 'min:0'],
            'mobilization_advance_unit' => ['required', 'in:Cr,L'],
            'mobilization_advance_status' => ['required', 'in:Pending,Requested,Received'],
            'scope_of_work' => ['required', 'string'],
            'active_status' => ['required', 'in:0,1'],
            'team' => ['required', 'array', 'min:1'],
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
            'items.*.inspection_by' => ['nullable', Rule::in(['RITES', 'RDSO', 'Consignee'])],
            'items.*.payment_stages' => ['nullable', 'array'],
            'items.*.payment_stages.*' => [Rule::in(PaymentStages::PERCENTAGES)],
            'stations' => ['sometimes', 'array'],
            'stations.*.station_id' => [
                'nullable',
                Rule::exists('stations', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'end_date.after_or_equal' => 'The end date must be on or after the start date.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        if (! $this->boolean('finish', true) && $this->string('current_step')->toString() !== 'items') {
            return;
        }

        $validator->after(function (Validator $validator) {
            PaymentStages::validateItems($this->input('items', []), $validator);
        });
    }
}
