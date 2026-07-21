<?php

namespace App\Exports\Settings;

use App\Imports\Settings\SettingsImportDefinition;
use App\Models\ImportLog;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SettingsErrorReportSheet implements FromArray, ShouldAutoSize, WithEvents, WithStyles, WithTitle
{
    public function __construct(
        private readonly SettingsImportDefinition $definition,
        private readonly ImportLog $importLog,
    ) {}

    /**
     * @return array<int, array<int, string>>
     */
    public function array(): array
    {
        $rows = [
            array_merge(['Row Number', 'Status', 'Errors'], $this->definition->headings()),
        ];

        foreach (($this->importLog->errors ?? []) as $errorRow) {
            $values = $errorRow['values'] ?? [];
            $rows[] = array_merge(
                [
                    (string) ($errorRow['row_number'] ?? ''),
                    (string) ($errorRow['status'] ?? ''),
                    implode('; ', $errorRow['errors'] ?? []),
                ],
                array_map(
                    fn (string $key): string => (string) ($values[$key] ?? ''),
                    $this->definition->keys(),
                ),
            );
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Errors';
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => '0F2436'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'F3EDE0'],
                ],
            ],
        ];
    }

    /**
     * @return array<class-string, callable>
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                $sheet = $event->sheet->getDelegate();
                $highestColumn = $sheet->getHighestColumn();
                $highestRow = $sheet->getHighestRow();

                $sheet->freezePane('A2');
                $sheet->setAutoFilter("A1:{$highestColumn}1");
                $sheet->getStyle("A1:{$highestColumn}{$highestRow}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_TOP)
                    ->setWrapText(true);
            },
        ];
    }
}
