<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserTypePermissionRequest extends FormRequest
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
            'permissions' => ['required', 'array'],
            'permissions.*.user_screen_id' => [
                'required',
                'integer',
                Rule::exists('user_screens', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'permissions.*.can_view' => ['boolean'],
            'permissions.*.can_add' => ['boolean'],
            'permissions.*.can_update' => ['boolean'],
            'permissions.*.can_delete' => ['boolean'],
        ];
    }
}
