<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\ValidatesLoaItemAllocation;
use App\Http\Requests\Admin\Concerns\ValidatesPurchaseOrderItemTotals;
use App\Models\PurchaseOrder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdatePurchaseOrderRequest extends FormRequest
{
    use ValidatesLoaItemAllocation, ValidatesPurchaseOrderItemTotals;

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
     * Same header + items shape as StorePurchaseOrderRequest — editing
     * replaces the PO's full item set the same way LoaController's
     * replaceItems() does for LOA items.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'po_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('purchase_orders', 'po_number')
                    ->where(fn ($query) => $query->where('is_delete', false))
                    ->ignore($this->currentPurchaseOrderId()),
            ],
            'order_date' => ['required', 'date'],
            'loa_id' => [
                'required',
                Rule::exists('loas', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'vendor_id' => [
                'required',
                Rule::exists('vendors', 'id')->where(fn ($query) => $query->where('is_delete', false)),
            ],
            'delivery_date' => ['required', 'date', 'after_or_equal:order_date'],
            'status' => ['required', Rule::in(PurchaseOrder::STATUSES)],
            'payment_type' => ['required', Rule::in(PurchaseOrder::PAYMENT_TYPES)],

            'items' => ['required', 'array', 'min:1'],
            'items.*.loa_item_id' => [
                'required',
                Rule::exists('loa_items', 'id')->where(fn ($query) => $query->where('loa_id', $this->input('loa_id'))),
            ],
            'items.*.ordered_qty' => ['required', 'numeric', 'min:0.001'],
            'items.*.received_qty' => ['required', 'numeric', 'min:0', 'lte:items.*.ordered_qty'],
            'items.*.unit_price_incl_gst' => ['required', 'numeric', 'min:0'],
            'items.*.unit_price_excl_gst' => ['required', 'numeric', 'min:0'],
            'items.*.agreed_rate' => ['required', 'numeric', 'min:0'],
            'items.*.total_price_incl_gst' => ['required', 'numeric', 'min:0'],
            'items.*.total_price_excl_gst' => ['required', 'numeric', 'min:0'],
            'items.*.vendor_quote_price' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'po_number.unique' => 'A purchase order with this PO number already exists.',
            'delivery_date.after_or_equal' => 'The expected delivery date must be on or after the PO date.',
            'items.*.loa_item_id.exists' => 'The selected line item does not belong to the selected LOA.',
            'items.*.received_qty.lte' => 'The received quantity cannot exceed the ordered quantity.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $this->validateLoaItemAllocation($validator, $this->input('items', []), $this->currentPurchaseOrderId());
            $this->validateItemTotals($validator, $this->input('items', []));
        });
    }

    private function currentPurchaseOrderId(): ?int
    {
        $purchaseOrder = $this->route('purchase_order');

        return $purchaseOrder instanceof PurchaseOrder ? $purchaseOrder->id : null;
    }
}
