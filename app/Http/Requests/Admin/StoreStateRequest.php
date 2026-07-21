<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStateRequest extends FormRequest
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
                Rule::unique('states', 'name')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'code' => [
                'nullable',
                'string',
                'max:10',
                Rule::unique('states', 'code')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'active_status' => ['required', 'in:0,1'],
        ];
    }
}
