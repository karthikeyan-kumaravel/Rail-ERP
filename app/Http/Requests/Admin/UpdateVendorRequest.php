<?php

namespace App\Http\Requests\Admin;

use App\Models\Vendor;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVendorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'pan_no' => strtoupper((string) $this->input('pan_no')),
            'ifsc_code' => strtoupper((string) $this->input('ifsc_code')),
            'gst_no' => $this->filled('gst_no') ? strtoupper((string) $this->input('gst_no')) : null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $vendor = $this->route('vendor');
        $vendorId = $vendor instanceof Vendor ? $vendor->id : null;

        return [
            'company_name' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'contact_no' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s]{7,20}$/'],
            'alternate_contact_no' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+\-\s]{7,20}$/'],
            'email' => ['nullable', 'email', 'max:255'],
            'gst_no' => ['nullable', 'string', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/'],
            'pan_no' => ['required', 'string', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/'],
            'pan_proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'pincode' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
            'state_id' => [
                'nullable',
                Rule::exists('states', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'district_id' => [
                'nullable',
                Rule::exists('districts', 'id')->where(
                    fn ($query) => $query
                        ->where('is_delete', false)
                        ->where('state_id', $this->input('state_id')),
                ),
            ],
            'zone_name' => ['nullable', 'string', 'max:255'],
            'bank_name' => ['required', 'string', 'max:255'],
            'branch_name' => ['nullable', 'string', 'max:255'],
            'account_no' => ['required', 'string', 'max:30', 'regex:/^[A-Za-z0-9]{5,30}$/'],
            'ifsc_code' => ['required', 'string', 'regex:/^[A-Z]{4}0[A-Z0-9]{6}$/'],
            'account_holder_name' => ['required', 'string', 'max:255'],
            'bank_proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'address' => ['required', 'string'],
            'username' => ['nullable', 'string', 'max:255', Rule::unique('vendors', 'username')->ignore($vendorId)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'active_status' => ['required', 'in:0,1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'contact_no.regex' => 'Enter a valid contact number.',
            'alternate_contact_no.regex' => 'Enter a valid contact number.',
            'gst_no.regex' => 'Enter a valid 15-character GST number.',
            'pan_no.regex' => 'Enter a valid PAN number (e.g. ABCDE1234F).',
            'pincode.regex' => 'Pincode must be exactly 6 digits.',
            'district_id.exists' => 'The selected district does not belong to the selected state.',
            'ifsc_code.regex' => 'Enter a valid IFSC code (e.g. SBIN0001234).',
        ];
    }
}
