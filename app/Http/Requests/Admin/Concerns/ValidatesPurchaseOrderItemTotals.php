<?php

namespace App\Http\Requests\Admin\Concerns;

use Illuminate\Validation\Validator;

trait ValidatesPurchaseOrderItemTotals
{
    /**
     * Ensures each item's total price actually reconciles with its own
     * unit price and ordered quantity, so a mistyped or tampered total
     * can't silently diverge from the unit economics it's supposed to
     * represent — these totals roll straight into the dashboard's
     * total value figure.
     *
     * @param  array<int, array{ordered_qty?: mixed, unit_price_incl_gst?: mixed, unit_price_excl_gst?: mixed, total_price_incl_gst?: mixed, total_price_excl_gst?: mixed}>  $items
     */
    protected function validateItemTotals(Validator $validator, array $items): void
    {
        foreach ($items as $index => $item) {
            $this->validateItemTotal($validator, $index, $item, 'unit_price_incl_gst', 'total_price_incl_gst');
            $this->validateItemTotal($validator, $index, $item, 'unit_price_excl_gst', 'total_price_excl_gst');
        }
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function validateItemTotal(Validator $validator, int $index, array $item, string $unitPriceField, string $totalPriceField): void
    {
        if (! is_numeric($item['ordered_qty'] ?? null)
            || ! is_numeric($item[$unitPriceField] ?? null)
            || ! is_numeric($item[$totalPriceField] ?? null)) {
            return;
        }

        $expectedTotal = round((float) $item[$unitPriceField] * (float) $item['ordered_qty'], 2);
        $submittedTotal = round((float) $item[$totalPriceField], 2);

        if (abs($expectedTotal - $submittedTotal) > 0.01) {
            $validator->errors()->add(
                "items.{$index}.{$totalPriceField}",
                sprintf(
                    'Expected %s based on unit price × ordered qty, got %s.',
                    number_format($expectedTotal, 2),
                    number_format($submittedTotal, 2),
                ),
            );
        }
    }
}
