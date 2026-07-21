<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDistrictRequest extends FormRequest
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
            'state_id' => [
                'required',
                Rule::exists('states', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('districts', 'name')->where(
                    fn ($query) => $query
                        ->where('state_id', $this->input('state_id'))
                        ->where('is_delete', false),
                ),
            ],
            'code' => ['nullable', 'string', 'max:10'],
            'active_status' => ['required', 'in:0,1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'This district name is already used by another district in the same state. Please choose a different name.',
        ];
    }
}
