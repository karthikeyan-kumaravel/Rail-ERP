<?php

namespace App\Http\Requests\Admin;

use App\Models\City;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCityRequest extends FormRequest
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
        $city = $this->route('city');
        $cityId = $city instanceof City ? $city->id : null;

        return [
            'state_id' => [
                'required',
                Rule::exists('states', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'district_id' => [
                'required',
                Rule::exists('districts', 'id')->where(
                    fn ($query) => $query
                        ->where('is_delete', false)
                        ->where('state_id', $this->input('state_id')),
                ),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('cities', 'name')
                    ->where(
                        fn ($query) => $query
                            ->where('district_id', $this->input('district_id'))
                            ->where('is_delete', false),
                    )
                    ->ignore($cityId),
            ],
            'city_code' => ['nullable', 'string', 'max:10'],
            'pincode' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
            'active_status' => ['required', 'in:0,1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'This city name is already used by another city in the same district. Please choose a different name.',
            'district_id.exists' => 'The selected district does not belong to the selected state.',
            'pincode.regex' => 'Pincode must be exactly 6 digits.',
        ];
    }
}
