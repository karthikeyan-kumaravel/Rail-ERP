<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'branch_name' => 'required|string|max:255',
            'ifsc_code' => 'required|string|max:20',
            'account_number' => 'required|string|max:50',
            'account_holder_name' => 'required|string|max:255',
            'account_type' => 'required|in:Savings,Current',
            'bank_address' => 'required|string',
            'pincode' => 'required|string|max:10',
            'contact_number' => 'required|string|max:15',
            'email' => 'required|email',
            'active_status' => 'required|in:1,0',
        ];
    }
}
