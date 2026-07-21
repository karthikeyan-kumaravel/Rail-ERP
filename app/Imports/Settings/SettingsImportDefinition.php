<?php

namespace App\Imports\Settings;

/**
 * Describes a Settings import module: template columns, examples, and rules
 * used by the shared import service.
 */
class SettingsImportDefinition
{
    /**
     * @param  array<int, array{key: string, heading: string, required?: bool, format?: string}>  $columns
     * @param  array<int, array<string, string>>  $sampleRows
     * @param  array<int, string>  $instructions
     */
    public function __construct(
        public readonly string $module,
        public readonly string $label,
        public readonly string $modelClass,
        public readonly string $sheetTitle,
        public readonly array $columns,
        public readonly array $sampleRows,
        public readonly array $instructions,
    ) {}

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return array_map(
            fn (array $column): string => $column['heading'],
            $this->columns,
        );
    }

    /**
     * @return array<int, string>
     */
    public function keys(): array
    {
        return array_map(
            fn (array $column): string => $column['key'],
            $this->columns,
        );
    }

    /**
     * @return array<string, string>
     */
    public function headingMap(): array
    {
        $map = [];

        foreach ($this->columns as $column) {
            $map[$this->normalizeHeading($column['heading'])] = $column['key'];
        }

        return $map;
    }

    public function normalizeHeading(string $heading): string
    {
        $heading = strtolower(trim(str_replace('*', '', $heading)));
        $heading = preg_replace('/[^a-z0-9]+/', '_', $heading) ?? $heading;

        return trim($heading, '_');
    }
}
