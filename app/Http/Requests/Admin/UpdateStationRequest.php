<?php

namespace App\Http\Requests\Admin;

use App\Models\Station;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStationRequest extends FormRequest
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
        $station = $this->route('station');
        $stationId = $station instanceof Station ? $station->id : null;

        return [
            'zone_id' => [
                'required',
                Rule::exists('zones', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'division_id' => [
                'required',
                Rule::exists('divisions', 'id')->where(
                    fn ($query) => $query
                        ->where('is_delete', false)
                        ->where('zone_id', $this->input('zone_id')),
                ),
            ],
            'station_code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('stations', 'station_code')
                    ->where(fn ($query) => $query->where('is_delete', false))
                    ->ignore($stationId),
            ],
            'station_name' => ['required', 'string', 'max:255'],
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
            'city_id' => [
                'required',
                Rule::exists('cities', 'id')->where(
                    fn ($query) => $query
                        ->where('is_delete', false)
                        ->where('district_id', $this->input('district_id')),
                ),
            ],
            'address' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'active_status' => ['required', 'in:0,1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'division_id.exists' => 'The selected division does not belong to the selected zone.',
            'station_code.unique' => 'This station code is already in use. Please choose a different code.',
            'district_id.exists' => 'The selected district does not belong to the selected state.',
            'city_id.exists' => 'The selected city does not belong to the selected district.',
        ];
    }
}
