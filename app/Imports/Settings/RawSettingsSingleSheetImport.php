<?php

namespace App\Imports\Settings;

use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class RawSettingsSingleSheetImport implements ToArray, WithChunkReading
{
    /**
     * @var array<int, array<int, mixed>>
     */
    private array $rows = [];

    /**
     * @param  array<int, array<int, mixed>>  $array
     */
    public function array(array $array): void
    {
        $this->rows = array_merge($this->rows, $array);
    }

    /**
     * @return array<int, array<int, mixed>>
     */
    public function rows(): array
    {
        return $this->rows;
    }

    public function chunkSize(): int
    {
        return 500;
    }
}
