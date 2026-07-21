<?php

namespace App\Exports\Settings;

use App\Imports\Settings\SettingsImportDefinition;
use App\Models\ImportLog;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class SettingsErrorReportExport implements WithMultipleSheets
{
    public function __construct(
        private readonly SettingsImportDefinition $definition,
        private readonly ImportLog $importLog,
    ) {}

    /**
     * @return array<int, object>
     */
    public function sheets(): array
    {
        return [
            new SettingsErrorReportSheet($this->definition, $this->importLog),
        ];
    }
}
