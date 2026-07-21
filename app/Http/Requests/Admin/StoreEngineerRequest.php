<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\AppliesStepValidation;
use App\Models\Engineer;
use App\Support\EngineerFormSteps;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEngineerRequest extends FormRequest
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
            'pan_number' => strtoupper((string) $this->input('pan_number')),
            'ifsc_code' => $this->filled('ifsc_code') ? strtoupper((string) $this->input('ifsc_code')) : null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->scopeRulesToStep($this->baseRules(), EngineerFormSteps::FIELDS_BY_TAB);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    private function baseRules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(Engineer::GENDERS)],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'blood_group' => ['nullable', Rule::in(Engineer::BLOOD_GROUPS)],
            'nationality' => ['nullable', 'string', 'max:100'],
            'marital_status' => ['nullable', Rule::in(Engineer::MARITAL_STATUSES)],
            'mobile_number' => [
                'required',
                'string',
                'regex:/^[6-9][0-9]{9}$/',
                Rule::unique('engineers', 'mobile_number')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'alternate_mobile_number' => ['nullable', 'string', 'regex:/^[6-9][0-9]{9}$/'],
            'official_email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('engineers', 'official_email')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'personal_email' => ['nullable', 'email', 'max:255'],
            'current_address' => ['required', 'string'],
            'permanent_address' => ['required', 'string'],
            'state_id' => [
                'nullable',
                Rule::exists('states', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'city_id' => [
                'nullable',
                Rule::exists('cities', 'id')->where(
                    fn ($query) => $query
                        ->where('is_delete', false)
                        ->where('state_id', $this->input('state_id')),
                ),
            ],
            'postal_code' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
            'aadhaar_number' => [
                'required',
                'string',
                'regex:/^[0-9]{12}$/',
                Rule::unique('engineers', 'aadhaar_number')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'pan_number' => [
                'required',
                'string',
                'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/',
                Rule::unique('engineers', 'pan_number')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'date_of_joining' => ['required', 'date'],
            'employee_status' => ['required', Rule::in(Engineer::EMPLOYEE_STATUSES)],
            'engineer_type_id' => [
                'required',
                Rule::exists('engineer_types', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'branch_name' => ['nullable', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:30', 'regex:/^[A-Za-z0-9]{5,30}$/', 'confirmed'],
            'ifsc_code' => ['nullable', 'string', 'regex:/^[A-Z]{4}0[A-Z0-9]{6}$/'],
            'pf_account_number' => ['nullable', 'string', 'max:50'],
            'esi_account_number' => ['nullable', 'string', 'max:50'],
            'languages_known' => ['nullable', 'array'],
            'languages_known.*' => [Rule::in(Engineer::LANGUAGES)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'mobile_number.regex' => 'Enter a valid 10-digit mobile number.',
            'alternate_mobile_number.regex' => 'Enter a valid 10-digit mobile number.',
            'city_id.exists' => 'The selected city does not belong to the selected state.',
            'postal_code.regex' => 'Postal code must be exactly 6 digits.',
            'aadhaar_number.regex' => 'Aadhaar number must be exactly 12 digits.',
            'pan_number.regex' => 'Enter a valid PAN number (e.g. ABCDE1234F).',
            'account_number.confirmed' => 'Account number confirmation does not match.',
            'ifsc_code.regex' => 'Enter a valid IFSC code (e.g. SBIN0001234).',
        ];
    }
}
