<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('projects', 'name')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'customer_id' => [
                'required',
                Rule::exists('customers', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'zone_id' => [
                'required',
                Rule::exists('zones', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'division_id' => [
                'required',
                Rule::exists('divisions', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'loa_id' => [
                'required',
                Rule::exists('loas', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'contract_value' => ['required', 'numeric', 'min:0'],
            'active_status' => ['required', 'in:0,1'],
        ];
    }
}
