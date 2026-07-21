<?php

namespace App\Http\Requests\Admin;

use App\Models\UserScreen;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserScreenRequest extends FormRequest
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
        $userScreen = $this->route('user_screen');
        $userScreenId = $userScreen instanceof UserScreen ? $userScreen->id : null;

        return [
            'main_screen_id' => [
                'nullable',
                Rule::exists('user_screens', 'id')->where(fn ($query) => $query->where('is_delete', false)),
                Rule::notIn([$userScreenId]),
            ],
            'screen_name' => ['required', 'string', 'max:255'],
            'folder_name' => ['required', 'string', 'max:255'],
            'order_no' => [
                'required',
                'integer',
                'min:0',
                Rule::unique('user_screens', 'order_no')
                    ->where(
                        fn ($query) => $query
                            ->where('main_screen_id', $this->input('main_screen_id'))
                            ->where('is_delete', false),
                    )
                    ->ignore($userScreenId),
            ],
            'icon' => ['required', 'string', Rule::in(UserScreen::ICONS)],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:0,1'],
            'can_add' => ['boolean'],
            'can_update' => ['boolean'],
            'can_list' => ['boolean'],
            'can_delete' => ['boolean'],
            'can_view' => ['boolean'],
            'can_cancel' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'order_no.unique' => 'This order number is already used by another screen at the same level. Please choose a different order number.',
        ];
    }
}
