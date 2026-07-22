<?php

namespace App\Services;

use App\Imports\LoaItems\RawLoaItemsImport;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use Stringable;
use Throwable;

class LoaItemImportService
{
    /**
     * Normalized aliases for the ten columns in the Railway LOA item sheet.
     * Newlines and punctuation are removed before matching.
     *
     * @var array<string, array<int, string>>
     */
    private const HEADER_ALIASES = [
        'item_no' => [
            'item sho',
            'item sno',
            'item s no',
            'item sl no',
            'item sr no',
            'item serial no',
            'item serial number',
            'item no',
            'item number',
            's no',
            'sl no',
            'sr no',
            'serial no',
        ],
        'item_description' => [
            'item desc',
            'item description',
            'description',
            'item details',
        ],
        'item_code' => [
            'item code',
            'code',
        ],
        'item_quantity' => [
            'item qty',
            'item quantity',
            'qty',
            'quantity',
        ],
        'quantity_unit' => [
            'qty unit',
            'quantity unit',
            'qty uom',
            'quantity uom',
            'unit of quantity',
            'uom',
        ],
        'unit_rate' => [
            'unit rate rs',
            'unit rate in rs',
            'unit rate',
            'rate rs',
            'basic unit rate',
        ],
        'escalation' => [
            'escl',
            'escl percent',
            'escalation',
            'escalation percent',
            'escalation percentage',
            'esc',
        ],
        'advertised_value' => [
            'advt value rs',
            'advt value in rs',
            'advt value',
            'advertised value rs',
            'advertised value in rs',
            'advertised value',
            'estimated value rs',
        ],
        'bid_rate' => [
            'bid rate unit rate',
            'bid rate per unit',
            'bid unit rate',
            'bid rate',
            'quoted rate unit rate',
            'quoted rate per unit',
            'quoted rate',
        ],
        'bid_amount' => [
            'bid amount rs',
            'bid amount in rs',
            'bid amount',
            'quoted amount rs',
            'quoted amount',
        ],
    ];

    /**
     * @var array<string, string>
     */
    private const HEADER_LABELS = [
        'item_no' => 'Item Sho.',
        'item_description' => 'Item Desc',
        'item_code' => 'Item Code',
        'item_quantity' => 'Item Qty',
        'quantity_unit' => 'Qty Unit',
        'unit_rate' => 'Unit Rate (Rs)',
        'escalation' => 'Escl. (%)',
        'advertised_value' => 'Advt. Value (Rs)',
        'bid_rate' => 'Bid Rate / Unit Rate',
        'bid_amount' => 'Bid Amount (Rs)',
    ];

    /**
     * @return array{
     *     items: array<int, array{
     *         schedule_name: string|null,
     *         schedule_advertised_value: int|float|null,
     *         item_no: string,
     *         item_description: string,
     *         item_code: string|null,
     *         item_quantity: int|float,
     *         quantity_unit: string,
     *         unit_rate: int|float,
     *         escalation: int|float|null,
     *         advertised_value: int|float,
     *         bid_rate: int|float,
     *         bid_rate_unit: string|null,
     *         bid_percentage_value: int|float,
     *         bid_amount: int|float,
     *         rebate_enabled: bool,
     *         rebate_percentage: int|float,
     *         rebate_amount: int|float,
     *         final_bid_amount: int|float
     *     }>,
     *     summary: array{imported_rows: int, skipped_rows: int, header_row: int}
     * }
     */
    public function preview(UploadedFile $file): array
    {
        $rows = $this->readRows($file);
        [$headerIndex, $columnMap] = $this->findHeader($rows);
        $lastContentIndex = $this->lastContentIndex($rows);
        $items = [];
        $rowErrors = [];
        $skippedRows = 0;
        $scheduleName = null;
        $scheduleAdvertisedValue = null;

        for ($rowIndex = $headerIndex + 1; $rowIndex <= $lastContentIndex; $rowIndex++) {
            $rawRow = $rows[$rowIndex] ?? [];
            $rowNumber = $rowIndex + 1;

            if ($this->isEmptyRawRow($rawRow)) {
                $skippedRows++;

                continue;
            }

            $values = $this->mappedValues($rawRow, $columnMap);

            if ($this->isEmptyMappedRow($values) || $this->isFooterRow($values)) {
                $skippedRows++;

                continue;
            }

            if ($this->isScheduleMetadataRow($values)) {
                $scheduleName = $this->scheduleLabel($values);
                $scheduleValueErrors = [];
                $scheduleAdvertisedValue = $this->optionalNonNegativeNumber(
                    $values['advertised_value'],
                    'Schedule advertised value',
                    $scheduleValueErrors,
                );

                if ($scheduleValueErrors !== []) {
                    $rowErrors[] = $this->rowErrorMessage($rowNumber, $scheduleValueErrors);
                }

                continue;
            }

            if ($this->isPlainGroupRow($values)) {
                $skippedRows++;

                continue;
            }

            [$item, $errors] = $this->parseItemRow(
                $values,
                $scheduleName,
                $scheduleAdvertisedValue,
            );

            if ($errors !== []) {
                $rowErrors[] = $this->rowErrorMessage($rowNumber, $errors);

                continue;
            }

            if ($item !== null) {
                $items[] = $item;
            }
        }

        if ($rowErrors !== []) {
            throw ValidationException::withMessages([
                'rows' => $rowErrors,
            ]);
        }

        if ($items === []) {
            throw ValidationException::withMessages([
                'file' => 'The uploaded Excel file does not contain any item rows.',
            ]);
        }

        return [
            'items' => $items,
            'summary' => [
                'imported_rows' => count($items),
                'skipped_rows' => $skippedRows,
                'header_row' => $headerIndex + 1,
            ],
        ];
    }

    /**
     * @return array<int, array<int, mixed>>
     */
    private function readRows(UploadedFile $file): array
    {
        $import = new RawLoaItemsImport;

        try {
            Excel::import($import, $file);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'file' => 'The uploaded Excel file could not be read.',
            ]);
        }

        return $import->rows();
    }

    /**
     * @param  array<int, array<int, mixed>>  $rows
     * @return array{int, array<string, int>}
     */
    private function findHeader(array $rows): array
    {
        $bestMap = [];
        $sawContent = false;

        foreach ($rows as $rowIndex => $row) {
            if ($this->isEmptyRawRow($row)) {
                continue;
            }

            $sawContent = true;
            $map = $this->headerMap($row);

            if (count($map) > count($bestMap)) {
                $bestMap = $map;
            }

            if (count($map) === count(self::HEADER_LABELS)) {
                return [$rowIndex, $map];
            }
        }

        if (! $sawContent) {
            throw ValidationException::withMessages([
                'file' => 'The uploaded Excel file does not contain any data.',
            ]);
        }

        $missingColumns = array_diff_key(self::HEADER_LABELS, $bestMap);

        throw ValidationException::withMessages([
            'file' => 'Missing required columns: '.implode(', ', array_values($missingColumns)).'.',
        ]);
    }

    /**
     * @param  array<int, mixed>  $row
     * @return array<string, int>
     */
    private function headerMap(array $row): array
    {
        $map = [];

        foreach ($row as $columnIndex => $value) {
            $key = $this->canonicalHeader($this->normalizeHeading($this->cellText($value)));

            if ($key !== null && ! array_key_exists($key, $map)) {
                $map[$key] = $columnIndex;
            }
        }

        return $map;
    }

    private function canonicalHeader(string $heading): ?string
    {
        foreach (self::HEADER_ALIASES as $key => $aliases) {
            if (in_array($heading, $aliases, true)) {
                return $key;
            }
        }

        return null;
    }

    private function normalizeHeading(?string $heading): string
    {
        if ($heading === null) {
            return '';
        }

        $normalized = strtolower(str_replace(['&', "\u{20B9}"], [' and ', ' rs '], $heading));
        $normalized = preg_replace('/[^\pL\pN]+/u', ' ', $normalized) ?? $normalized;

        return trim(preg_replace('/\s+/u', ' ', $normalized) ?? $normalized);
    }

    /**
     * @param  array<int, array<int, mixed>>  $rows
     */
    private function lastContentIndex(array $rows): int
    {
        for ($index = count($rows) - 1; $index >= 0; $index--) {
            if (! $this->isEmptyRawRow($rows[$index] ?? [])) {
                return $index;
            }
        }

        return -1;
    }

    /**
     * @param  array<int, mixed>  $rawRow
     * @param  array<string, int>  $columnMap
     * @return array<string, mixed>
     */
    private function mappedValues(array $rawRow, array $columnMap): array
    {
        $values = [];

        foreach (array_keys(self::HEADER_LABELS) as $key) {
            $values[$key] = $rawRow[$columnMap[$key]] ?? null;
        }

        return $values;
    }

    /**
     * @param  array<int, mixed>  $row
     */
    private function isEmptyRawRow(array $row): bool
    {
        foreach ($row as $value) {
            if (! $this->isBlank($value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function isEmptyMappedRow(array $values): bool
    {
        foreach ($values as $value) {
            if (! $this->isBlank($value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function isFooterRow(array $values): bool
    {
        $label = $this->normalizeHeading($this->scheduleLabel($values));

        return preg_match(
            '/^(?:grand total|sub total|subtotal|total(?: amount)?|notes?|remarks?|terms(?: and conditions)?|page(?: no)?|signature|authori[sz]ed signatory)\b/',
            $label,
        ) === 1;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function isScheduleMetadataRow(array $values): bool
    {
        $label = $this->scheduleLabel($values);

        if ($label === null || $this->hasItemPayload($values)) {
            return false;
        }

        return str_contains($this->normalizeHeading($label), 'schedule')
            || ! $this->isBlank($values['advertised_value']);
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function isPlainGroupRow(array $values): bool
    {
        if ($this->hasItemPayload($values)) {
            return false;
        }

        $itemNumber = $this->textOrNull($values['item_no']);
        $description = $this->textOrNull($values['item_description']);
        $labelCount = (int) ($itemNumber !== null) + (int) ($description !== null);

        if ($labelCount !== 1) {
            return false;
        }

        return $itemNumber === null || ! $this->looksLikeItemNumber($itemNumber);
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function hasItemPayload(array $values): bool
    {
        foreach ([
            'item_code',
            'item_quantity',
            'quantity_unit',
            'unit_rate',
            'escalation',
            'bid_rate',
            'bid_amount',
        ] as $key) {
            if (! $this->isBlank($values[$key])) {
                return true;
            }
        }

        return false;
    }

    private function looksLikeItemNumber(string $value): bool
    {
        return preg_match('/^(?:\d+(?:[.\/-]\d+)*[a-z]?|[a-z](?:[.\/-]?\d+)*)$/i', trim($value)) === 1;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    private function scheduleLabel(array $values): ?string
    {
        $parts = array_values(array_filter([
            $this->textOrNull($values['item_no']),
            $this->textOrNull($values['item_description']),
        ], fn (?string $value): bool => $value !== null));

        if ($parts === []) {
            return null;
        }

        return implode(' ', array_unique($parts));
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array{
     *     array{
     *         schedule_name: string|null,
     *         schedule_advertised_value: int|float|null,
     *         item_no: string,
     *         item_description: string,
     *         item_code: string|null,
     *         item_quantity: int|float,
     *         quantity_unit: string,
     *         unit_rate: int|float,
     *         escalation: int|float|null,
     *         advertised_value: int|float,
     *         bid_rate: int|float,
     *         bid_rate_unit: string|null,
     *         bid_percentage_value: int|float,
     *         bid_amount: int|float,
     *         rebate_enabled: bool,
     *         rebate_percentage: int|float,
     *         rebate_amount: int|float,
     *         final_bid_amount: int|float
     *     }|null,
     *     array<int, string>
     * }
     */
    private function parseItemRow(
        array $values,
        ?string $scheduleName,
        int|float|null $scheduleAdvertisedValue,
    ): array {
        $errors = [];
        $itemNumber = $this->requiredText($values['item_no'], 'Item number', 50, $errors);
        $description = $this->requiredText($values['item_description'], 'Item description', null, $errors);
        $itemCode = $this->optionalText($values['item_code'], 'Item code', 100, $errors);
        $quantity = $this->requiredNonNegativeNumber($values['item_quantity'], 'Item quantity', $errors);
        $quantityUnit = $this->requiredText($values['quantity_unit'], 'Quantity unit', 100, $errors);
        $unitRate = $this->requiredNonNegativeNumber($values['unit_rate'], 'Unit rate', $errors);
        $escalation = $this->optionalPercentage($values['escalation'], $errors);
        $advertisedValue = $this->requiredNonNegativeNumber(
            $values['advertised_value'],
            'Advertised value',
            $errors,
        );
        $bidRate = $this->requiredBidRate($values['bid_rate'], $errors);
        // The sheet's combined "Bid Rate/ Unit Rate" cell only ever carries a
        // number (optionally with trailing unit text we now ignore) — "%
        // Above"/"% Below" is a manual-entry concept the source sheets don't
        // express, so imported rows always start with no bid rate unit.
        $bidRateUnit = null;
        $bidAmount = $this->requiredNonNegativeNumber($values['bid_amount'], 'Bid amount', $errors);
        $bidPercentageValue = $advertisedValue !== null && $advertisedValue > 0 && $bidAmount !== null
            ? round(abs((($bidAmount - $advertisedValue) / $advertisedValue) * 100), 4)
            : null;

        if ($errors !== []
            || $itemNumber === null
            || $description === null
            || $quantity === null
            || $quantityUnit === null
            || $unitRate === null
            || $advertisedValue === null
            || $bidRate === null
            || $bidAmount === null) {
            return [null, $errors];
        }

        return [[
            'schedule_name' => $scheduleName,
            'schedule_advertised_value' => $scheduleAdvertisedValue,
            'item_no' => $this->normalizeItemNumber($itemNumber),
            'item_description' => $description,
            'item_code' => $itemCode,
            'item_quantity' => $quantity,
            'quantity_unit' => $quantityUnit,
            'unit_rate' => $unitRate,
            'escalation' => $escalation,
            'advertised_value' => $advertisedValue,
            'bid_rate' => $bidRate,
            'bid_rate_unit' => $bidRateUnit,
            'bid_percentage_value' => $bidPercentageValue,
            'bid_amount' => $bidAmount,
            // Imported rows never carry a rebate — the sheet's Bid Amount
            // stands as the Final Bid Amount until edited in-app.
            'rebate_enabled' => false,
            'rebate_percentage' => 0,
            'rebate_amount' => 0,
            'final_bid_amount' => $bidAmount,
        ], []];
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function requiredText(mixed $value, string $label, ?int $maxLength, array &$errors): ?string
    {
        $text = $this->textOrNull($value);

        if ($text === null) {
            $errors[] = "{$label} is required.";

            return null;
        }

        if ($maxLength !== null && mb_strlen($text) > $maxLength) {
            $errors[] = "{$label} must not be longer than {$maxLength} characters.";
        }

        return $text;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function optionalText(mixed $value, string $label, int $maxLength, array &$errors): ?string
    {
        $text = $this->textOrNull($value);

        if ($text !== null && mb_strlen($text) > $maxLength) {
            $errors[] = "{$label} must not be longer than {$maxLength} characters.";
        }

        return $text;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function requiredNonNegativeNumber(mixed $value, string $label, array &$errors): int|float|null
    {
        if ($this->isBlank($value)) {
            $errors[] = "{$label} is required.";

            return null;
        }

        $valid = false;
        $number = $this->parseNumber($value, $valid);

        if (! $valid || $number === null) {
            $errors[] = "{$label} must be a number.";

            return null;
        }

        if ($number < 0) {
            $errors[] = "{$label} must be at least zero.";
        }

        return $number;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function optionalNonNegativeNumber(mixed $value, string $label, array &$errors): int|float|null
    {
        if ($this->isBlank($value)) {
            return null;
        }

        $valid = false;
        $number = $this->parseNumber($value, $valid);

        if (! $valid || $number === null) {
            $errors[] = "{$label} must be a number.";

            return null;
        }

        if ($number < 0) {
            $errors[] = "{$label} must be at least zero.";
        }

        return $number;
    }

    /**
     * Parses a percentage cell leniently: descriptive text some sheets use
     * in place of a number (e.g. "At Par", "Not Applicable") is treated as
     * "no escalation" rather than a hard import error, since Escl. (%) is
     * now used directly in the Advt. Value calculation and must be numeric.
     *
     * @param  array<int, string>  $errors
     */
    private function optionalPercentage(mixed $value, array &$errors): int|float|null
    {
        if ($this->isBlank($value)) {
            return null;
        }

        $text = $this->cellText($value);
        $candidate = $text !== null ? rtrim(trim($text), "% \t\n\r\0\x0B") : $value;

        $valid = false;
        $number = $this->parseNumber($candidate, $valid);

        if (! $valid || $number === null) {
            return null;
        }

        if ($number < 0) {
            $errors[] = 'Escalation must be at least zero.';

            return null;
        }

        return $number;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function requiredBidRate(mixed $value, array &$errors): int|float|null
    {
        if ($this->isBlank($value)) {
            $errors[] = 'Bid rate is required.';

            return null;
        }

        $valid = false;
        $number = $this->parseNumber($value, $valid);

        if (! $valid) {
            $text = $this->cellText($value) ?? '';
            $matches = [];
            $matched = preg_match(
                '/[+-]?(?:(?:\d[\d,\x{00A0} ]*)(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?/u',
                $text,
                $matches,
            );

            if ($matched === 1) {
                $number = $this->parseNumber($matches[0], $valid);
            }
        }

        if (! $valid || $number === null) {
            $errors[] = 'Bid rate must contain a valid number.';

            return null;
        }

        if ($number < 0) {
            $errors[] = 'Bid rate must be at least zero.';
        }

        return $number;
    }

    private function parseNumber(mixed $value, bool &$valid): int|float|null
    {
        $valid = false;

        if (is_int($value)) {
            $valid = true;

            return $value;
        }

        if (is_float($value)) {
            if (! is_finite($value)) {
                return null;
            }

            $valid = true;

            return $this->compactNumber($value);
        }

        if (! is_string($value)) {
            return null;
        }

        $normalized = trim(str_replace("\u{00A0}", ' ', $value));
        $negativeParentheses = str_starts_with($normalized, '(') && str_ends_with($normalized, ')');

        if ($negativeParentheses) {
            $normalized = trim(substr($normalized, 1, -1));
        }

        $normalized = preg_replace('/(?:\x{20B9}|\b(?:rs|inr)\.?\s*)/iu', '', $normalized) ?? $normalized;
        $normalized = str_replace([',', ' '], '', $normalized);

        if (preg_match('/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/', $normalized) !== 1) {
            return null;
        }

        $number = (float) $normalized;

        if (! is_finite($number)) {
            return null;
        }

        if ($negativeParentheses) {
            $number *= -1;
        }

        $valid = true;

        return $this->compactNumber($number);
    }

    private function compactNumber(float $number): int|float
    {
        if (floor($number) === $number && $number <= PHP_INT_MAX && $number >= PHP_INT_MIN) {
            return (int) $number;
        }

        return $number;
    }

    private function normalizeItemNumber(string $value): string
    {
        $trimmed = trim($value);

        if (preg_match('/^\d+$/', $trimmed) === 1) {
            return str_pad($trimmed, 2, '0', STR_PAD_LEFT);
        }

        if (preg_match('/^\d+\.0+$/', $trimmed) === 1) {
            return str_pad((string) (int) $trimmed, 2, '0', STR_PAD_LEFT);
        }

        return $trimmed;
    }

    private function isBlank(mixed $value): bool
    {
        return $value === null || ($this->cellText($value) ?? '') === '';
    }

    private function textOrNull(mixed $value): ?string
    {
        $text = $this->cellText($value);

        return $text === '' ? null : $text;
    }

    private function cellText(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value)) {
            return trim(str_replace(["\r\n", "\r", "\u{00A0}"], ["\n", "\n", ' '], $value));
        }

        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if ($value instanceof Stringable) {
            return trim((string) $value);
        }

        return null;
    }

    /**
     * @param  array<int, string>  $errors
     */
    private function rowErrorMessage(int $rowNumber, array $errors): string
    {
        return "Row {$rowNumber}: ".implode(' ', $errors);
    }
}
