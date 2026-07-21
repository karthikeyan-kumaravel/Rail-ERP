<?php

namespace App\Http\Requests\Admin;

use App\Models\PurchaseOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePurchaseOrderRequest extends FormRequest
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
        $purchaseOrder = $this->route('purchase_order');
        $purchaseOrderId = $purchaseOrder instanceof PurchaseOrder ? $purchaseOrder->id : null;

        return [
            'po_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('purchase_orders', 'po_number')
                    ->where(fn ($query) => $query->where('is_delete', false))
                    ->ignore($purchaseOrderId),
            ],
            'supplier' => ['required', 'string', 'max:255'],
            'items_description' => ['required', 'string', 'max:2000'],
            'order_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999999.99'],
            'delivery_date' => ['required', 'date', 'after_or_equal:order_date'],
            'payment_terms' => ['required', 'string', 'max:255'],
            'total_qty' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'received_qty' => ['required', 'integer', 'min:0', 'max:4294967295', 'lte:total_qty'],
            'inspection_status' => ['required', Rule::in(PurchaseOrder::INSPECTION_STATUSES)],
            'dispatch_status' => ['required', Rule::in(PurchaseOrder::DISPATCH_STATUSES)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'delivery_date.after_or_equal' => 'The delivery date must be on or after the order date.',
            'received_qty.lte' => 'The received quantity cannot exceed the total quantity.',
        ];
    }
}
