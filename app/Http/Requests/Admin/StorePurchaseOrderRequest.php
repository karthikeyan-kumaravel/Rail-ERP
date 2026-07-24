<?php

namespace App\Http\Requests\Admin;

use App\Models\PurchaseOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePurchaseOrderRequest extends FormRequest
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
     * One purchase order document can cover several LOA line items, each
     * added via the "Add Item" grid on the create page — so the request
     * carries an `items` array and each entry becomes its own
     * `purchase_orders` row (sharing the same `po_number`).
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.po_number' => ['required', 'string', 'max:100'],
            'items.*.order_date' => ['required', 'date'],
            'items.*.loa_id' => [
                'required',
                Rule::exists('loas', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'items.*.loa_item_id' => ['required', Rule::exists('loa_items', 'id')],
            'items.*.vendor_id' => [
                'required',
                Rule::exists('vendors', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'items.*.ordered_qty' => ['required', 'numeric', 'min:0'],
            'items.*.received_qty' => ['required', 'numeric', 'min:0', 'lte:items.*.ordered_qty'],
            'items.*.unit_price_incl_gst' => ['required', 'numeric', 'min:0'],
            'items.*.unit_price_excl_gst' => ['required', 'numeric', 'min:0'],
            'items.*.agreed_rate' => ['required', 'numeric', 'min:0'],
            'items.*.total_price_incl_gst' => ['required', 'numeric', 'min:0'],
            'items.*.total_price_excl_gst' => ['required', 'numeric', 'min:0'],
            'items.*.vendor_quote_price' => ['required', 'numeric', 'min:0'],
            'items.*.delivery_date' => ['required', 'date', 'after_or_equal:items.*.order_date'],
            'items.*.status' => ['required', Rule::in(PurchaseOrder::STATUSES)],
            'items.*.payment_type' => ['required', Rule::in(PurchaseOrder::PAYMENT_TYPES)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.*.delivery_date.after_or_equal' => 'The expected delivery date must be on or after the PO date.',
            'items.*.received_qty.lte' => 'The received quantity cannot exceed the ordered quantity.',
        ];
    }
}
