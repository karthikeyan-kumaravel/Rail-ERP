<?php

namespace App\Http\Requests\Admin;

use App\Models\UserType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserTypeRequest extends FormRequest
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
        $userType = $this->route('user_type');
        $userTypeId = $userType instanceof UserType ? $userType->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('user_types', 'name')
                    ->where('is_delete', false)
                    ->ignore($userTypeId),
            ],
            'active_status' => ['required', 'in:0,1'],
        ];
    }
}
