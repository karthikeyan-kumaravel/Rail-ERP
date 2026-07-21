<?php

namespace App\Http\Requests\Admin;

use App\Models\Division;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDivisionRequest extends FormRequest
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
        $division = $this->route('division');
        $divisionId = $division instanceof Division ? $division->id : null;

        return [
            'zone_id' => [
                'required',
                Rule::exists('zones', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('divisions', 'name')
                    ->where(
                        fn ($query) => $query
                            ->where('zone_id', $this->input('zone_id'))
                            ->where('is_delete', false),
                    )
                    ->ignore($divisionId),
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
            'name.unique' => 'This division name is already used in the selected zone. Please choose a different name.',
        ];
    }
}
