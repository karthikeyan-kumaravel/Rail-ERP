<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserTypeRequest extends FormRequest
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
        // return [
        //     'name' => ['required', 'string', 'max:255', 'unique:user_types,name'],
        //     'active_status' => ['required', 'in:0,1'],
        // ];

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('user_types', 'name')->where('is_delete', false),
            ],
            'active_status' => ['required', 'in:0,1'],
        ];
    }
}
