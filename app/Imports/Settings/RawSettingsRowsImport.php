<?php

namespace App\Imports\Settings;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/**
 * Reads only the first sheet of an uploaded settings-import workbook.
 *
 * Templates and error reports always carry a second "Instructions"/"Error
 * Details" sheet after the data sheet; without WithMultipleSheets scoping to
 * sheet index 0, Excel::import() reads every sheet and merges their rows
 * together, turning instruction text into bogus data rows when a user
 * re-uploads a downloaded template.
 */
class RawSettingsRowsImport implements WithMultipleSheets
{
    private readonly RawSettingsSingleSheetImport $dataSheet;

    public function __construct()
    {
        $this->dataSheet = new RawSettingsSingleSheetImport;
    }

    /**
     * @return array<int, RawSettingsSingleSheetImport>
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
