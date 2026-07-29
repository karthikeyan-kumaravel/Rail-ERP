<?php

namespace App\Http\Requests\Admin;

use App\Models\Bank;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $bank = $this->route('bank');
        $bankId = $bank instanceof Bank ? $bank->id : null;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('banks', 'name')
                    ->where(fn ($query) => $query->where('is_delete', false))
                    ->ignore($bankId),
            ],
            'branch_name' => ['nullable', 'string', 'max:255'],
            'ifsc_code' => ['nullable', 'string', 'max:20'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'account_holder_name' => ['nullable', 'string', 'max:255'],
            'account_type' => ['nullable', 'in:Savings,Current'],
            'bank_address' => ['nullable', 'string'],
            'pincode' => ['nullable', 'string', 'max:10'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'active_status' => ['required', 'in:0,1'],
        ];
    }
}
