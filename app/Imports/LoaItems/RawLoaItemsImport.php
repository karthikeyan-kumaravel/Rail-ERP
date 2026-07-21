<?php

namespace App\Imports\LoaItems;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class RawLoaItemsImport implements WithMultipleSheets
{
    private readonly RawLoaItemsSingleSheetImport $dataSheet;

    public function __construct()
    {
        $this->dataSheet = new RawLoaItemsSingleSheetImport;
    }

    /**
     * @return array<int, RawLoaItemsSingleSheetImport>
     */
    public function sheets(): array
    {
        return [0 => $this->dataSheet];
    }

    /**
     * @return array<int, array<int, mixed>>
     */
    public function rows(): array
    {
        return $this->dataSheet->rows();
    }
}
