<?php

namespace App\Exports\Settings;

use App\Imports\Settings\SettingsImportDefinition;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SettingsInstructionsSheet implements FromArray, ShouldAutoSize, WithEvents, WithStyles, WithTitle
{
    public function __construct(
        private readonly SettingsImportDefinition $definition,
    ) {}

    /**
     * @return array<int, array<int, string>>
     */
    public function array(): array
    {
        $rows = [
            ['Instructions for '.$this->definition->label.' Import'],
            [''],
            ['Required Fields'],
        ];

        foreach ($this->definition->columns as $column) {
            if (($column['required'] ?? false) === true) {
                $rows[] = [$column['heading']];
            }
        }

        $rows[] = [''];
        $rows[] = ['Accepted Values and Import Rules'];

        foreach ($this->definition->instructions as $instruction) {
            $rows[] = [$instruction];
        }

        $rows[] = [''];
        $rows[] = ['Example Data'];
        $rows[] = $this->definition->headings();

        foreach ($this->definition->sampleRows as $sampleRow) {
            $rows[] = array_map(
                fn (string $key): string => $sampleRow[$key] ?? '',
                $this->definition->keys(),
            );
        }

        return $rows;
    }

    public function title(): string
    {
        return 'Instructions';
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
                    'size' => 14,
                    'color' => ['rgb' => '0F2436'],
                ],
            ],
            3 => [
                'font' => ['bold' => true],
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
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();

                $sheet->getStyle("A1:{$highestColumn}{$highestRow}")
                    ->getAlignment()
                    ->setVertical(Alignment::VERTICAL_TOP)
                    ->setWrapText(true);
                $sheet->getColumnDimension('A')->setWidth(65);
            },
        ];
    }
}
