<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScheduleTypeRequest extends FormRequest
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
            'schedule_name_id' => [
                'required',
                Rule::exists('schedule_names', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('schedule_types', 'name')->where(
                    fn ($query) => $query
                        ->where('schedule_name_id', $this->input('schedule_name_id'))
                        ->where('is_delete', false),
                ),
            ],
            'short_name' => ['required', 'string', 'max:20'],
            'active_status' => ['required', 'in:0,1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'This schedule type name is already used by another schedule type under the same schedule name. Please choose a different name.',
        ];
    }
}
