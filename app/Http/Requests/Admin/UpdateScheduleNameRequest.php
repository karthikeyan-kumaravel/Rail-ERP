<?php

namespace App\Http\Requests\Admin;

use App\Models\ScheduleName;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateScheduleNameRequest extends FormRequest
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
        $scheduleName = $this->route('schedule_name');
        $scheduleNameId = $scheduleName instanceof ScheduleName ? $scheduleName->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('schedule_names', 'name')
                    ->where(fn ($query) => $query->where('is_delete', false))
                    ->ignore($scheduleNameId),
            ],
            'active_status' => ['required', 'in:0,1'],
        ];
    }
}
