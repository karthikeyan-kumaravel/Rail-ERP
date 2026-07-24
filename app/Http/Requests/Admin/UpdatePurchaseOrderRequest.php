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
     * Unlike store() (which creates one row per added grid line), update()
     * edits a single already-persisted purchase order line.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'po_number' => ['required', 'string', 'max:100'],
            'order_date' => ['required', 'date'],
            'loa_id' => [
                'required',
                Rule::exists('loas', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'loa_item_id' => ['required', Rule::exists('loa_items', 'id')],
            'vendor_id' => [
                'required',
                Rule::exists('vendors', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'ordered_qty' => ['required', 'numeric', 'min:0'],
            'received_qty' => ['required', 'numeric', 'min:0', 'lte:ordered_qty'],
            'unit_price_incl_gst' => ['required', 'numeric', 'min:0'],
            'unit_price_excl_gst' => ['required', 'numeric', 'min:0'],
            'agreed_rate' => ['required', 'numeric', 'min:0'],
            'total_price_incl_gst' => ['required', 'numeric', 'min:0'],
            'total_price_excl_gst' => ['required', 'numeric', 'min:0'],
            'vendor_quote_price' => ['required', 'numeric', 'min:0'],
            'delivery_date' => ['required', 'date', 'after_or_equal:order_date'],
            'status' => ['required', Rule::in(PurchaseOrder::STATUSES)],
            'payment_type' => ['required', Rule::in(PurchaseOrder::PAYMENT_TYPES)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'delivery_date.after_or_equal' => 'The expected delivery date must be on or after the PO date.',
            'received_qty.lte' => 'The received quantity cannot exceed the ordered quantity.',
        ];
    }
}
