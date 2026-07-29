<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBankRequest extends FormRequest
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

            'name' => [
                'required',
                'string',
                'min:3',
                'max:100',
            ],

            'branch_name' => [
                'required',
                'string',
                'min:3',
                'max:100',
            ],

            'ifsc_code' => [
                'required',
                'string',
                'size:11',
                'regex:/^[A-Z]{4}0[A-Z0-9]{6}$/',
            ],

            'account_number' => [
                'required',
                'string',
                'min:9',
                'max:18',
                'unique:banks,account_number',
            ],

            'account_holder_name' => [
                'required',
                'string',
                'min:3',
                'max:100',
            ],

            'account_type' => [
                'required',
                'in:Savings,Current',
            ],

            'bank_address' => [
                'required',
                'string',
                'min:10',
                'max:255',
            ],

            'pincode' => [
                'required',
                'digits:6',
            ],

            'contact_number' => [
                'required',
                'digits:10',
            ],

            'email' => [
                'nullable',
                'email',
                'max:100',
            ],

            'active_status' => [
                'required',
                'in:0,1',
            ],

        ];
    }

    /**
     * Customize validation messages.
     */
    public function messages(): array
    {
        return [

            // 'name.required' => 'Bank Name is required.',

            'branch_name.required' => 'Branch Name is required.',

            'ifsc_code.required' => 'IFSC Code is required.',
            'ifsc_code.size' => 'IFSC Code must be exactly 11 characters.',
            'ifsc_code.regex' => 'Enter a valid IFSC Code.',

            'account_number.required' => 'Account Number is required.',
            'account_number.unique' => 'Account Number already exists.',

            'account_holder_name.required' => 'Account Holder Name is required.',

            'account_type.required' => 'Select Account Type.',

            'bank_address.required' => 'Bank Address is required.',

            'pincode.required' => 'Pincode is required.',
            'pincode.digits' => 'Pincode must be 6 digits.',

            'contact_number.required' => 'Contact Number is required.',
            'contact_number.digits' => 'Contact Number must be 10 digits.',

            'email.email' => 'Enter a valid Email Address.',

            'active_status.required' => 'Select Status.',
        ];
    }
}
