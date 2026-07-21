<?php

namespace App\Exports\Settings;

use App\Imports\Settings\SettingsImportDefinition;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class SettingsTemplateExport implements WithMultipleSheets
{
    public function __construct(
        private readonly SettingsImportDefinition $definition,
    ) {}

    /**
     * @return array<int, object>
     */
    public function sheets(): array
    {
        return [
            new SettingsTemplateSheet($this->definition),
            new SettingsInstructionsSheet($this->definition),
        ];
    }
}
