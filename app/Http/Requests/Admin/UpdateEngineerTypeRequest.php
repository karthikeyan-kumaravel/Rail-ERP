<?php

namespace App\Http\Requests\Admin;

use App\Models\EngineerType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEngineerTypeRequest extends FormRequest
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
        $engineerType = $this->route('engineer_type');
        $engineerTypeId = $engineerType instanceof EngineerType ? $engineerType->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('engineer_types', 'name')
                    ->where(fn ($query) => $query->where('is_delete', false))
                    ->ignore($engineerTypeId),
            ],
            'active_status' => ['required', 'in:0,1'],
        ];
    }
}
