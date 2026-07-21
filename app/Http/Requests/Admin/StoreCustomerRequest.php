<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'billing_address' => ['required', 'string'],
            'pin_code' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
            'state_id' => [
                'required',
                Rule::exists('states', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'district_id' => [
                'required',
                Rule::exists('districts', 'id')->where(
                    fn ($query) => $query
                        ->where('is_delete', false)
                        ->where('state_id', $this->input('state_id')),
                ),
            ],
            'zone' => ['required', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s]{7,20}$/'],
            'contact_landline_number' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'active_status' => ['required', 'in:0,1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pin_code.regex' => 'Pin code must be exactly 6 digits.',
            'district_id.exists' => 'The selected district does not belong to the selected state.',
            'contact_number.regex' => 'Enter a valid contact number.',
        ];
    }
}
