<?php

namespace App\Http\Requests\Admin;

use App\Models\Activity;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateActivityRequest extends FormRequest
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
        $activity = $this->route('activity');
        $activityId = $activity instanceof Activity ? $activity->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('activities', 'name')
                    ->where(fn ($query) => $query->where('is_delete', false))
                    ->ignore($activityId),
            ],
            'active_status' => ['required', 'in:0,1'],
        ];
    }
}
