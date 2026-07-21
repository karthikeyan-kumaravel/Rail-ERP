<?php

namespace App\Support;

use Illuminate\Contracts\Validation\Validator;

/**
 * Single source of truth for the LOA item's multi-stage payment split
 * (`loa_items.payment_stages`), shared between StoreLoaRequest and
 * UpdateLoaRequest so a future payment stage only needs to be added here.
 */
final class PaymentStages
{
    /**
     * @var array<int, string>
     */
    public const array KEYS = [
        'Supply',
        'Supply & Installation',
        'Commissioning',
        'Final Payment',
    ];

    /**
     * @var array<int, string>
     */
    public const array PERCENTAGES = ['5%', '20%', '70%', '90%'];

    /**
     * Adds a validation error for every LOA item whose `payment_stages` map
     * uses an unrecognized stage key or doesn't add up to exactly 100%. A
     * blank/omitted map is left alone — configuring payment stages is
     * optional per item.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    public static function validateItems(array $items, Validator $validator): void
    {
        foreach ($items as $index => $item) {
            $stages = $item['payment_stages'] ?? null;

            if (! is_array($stages) || $stages === []) {
                continue;
            }

            $invalidKeys = array_diff(array_keys($stages), self::KEYS);

            if ($invalidKeys !== []) {
                $validator->errors()->add(
                    "items.{$index}.payment_stages",
                    'Unrecognized payment stage(s): '.implode(', ', $invalidKeys).'.',
                );

                continue;
            }

            $total = array_sum(array_map(
                fn (mixed $value): int => (int) rtrim((string) $value, '%'),
                $stages,
            ));

            if ($total !== 100) {
                $validator->errors()->add(
                    "items.{$index}.payment_stages",
                    'Payment stage percentages must add up to 100%.',
                );
            }
        }
    }
}
