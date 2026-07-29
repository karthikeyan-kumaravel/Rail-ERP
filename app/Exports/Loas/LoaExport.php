<?php

namespace App\Exports\Loas;

use App\Models\Loa;
use App\Models\LoaFinancialSecurity;
use App\Models\LoaItem;
use App\Support\PaymentStages;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\RichText\RichText;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Mirrors resources/views/pdf/loa.blade.php section-for-section (letterhead,
 * LOA Details + Financial Security/Project Team side by side, Scope of Work,
 * then the Item Details grid with schedule grouping) so the Excel download
 * reads as the same document as the PDF download, just in spreadsheet form.
 * Built entirely through `WithEvents` rather than `FromArray` because the
 * layout needs merged cells, mixed-style rich text (the Financial Security
 * note lines, the Bid Rate sub-line), and per-row conditional colors that a
 * flat array + column styles can't express.
 */
class LoaExport implements WithEvents, WithTitle
{
    private const string FONT = 'Arial';

    private const string NAVY = '0F2436';

    private const string ORANGE_ACCENT = 'F2905C';

    private const string MUTED_GRAY = '8A94A3';

    private const string LABEL_GRAY = '7C8798';

    private const string NOTE_GRAY = '64748B';

    private const string EMPTY_GRAY = '94A3B8';

    private const string STATUS_ACTIVE_BG = 'E6F6EC';

    private const string STATUS_ACTIVE_TEXT = '1F8F5C';

    private const string STATUS_INACTIVE_BG = 'FBE4E4';

    private const string STATUS_INACTIVE_TEXT = 'B91C1C';

    private const string URGENT_TEXT = '8B0000';

    private const string SECTION_BORDER = 'E2E7EE';

    private const string ROW_ODD_BG = 'F8FAFC';

    private const string ROW_BORDER = 'EDF0F4';

    private const string SCHEDULE_ROW_BG = 'F6EAD2';

    private const string SCHEDULE_ROW_TEXT = '7A5B12';

    private const string SCHEDULE_ROW_BORDER = 'EADFC0';

    private const string SCHEDULE_TOTAL_BG = 'FBF4E2';

    private const string SCHEDULE_TOTAL_BORDER = 'E0A94A';

    private const string CAPTION_BG = 'F6EAD2';

    private const string CAPTION_BORDER = 'C9A227';

    private const string CAPTION_TEXT = '6B4E10';

    private const string BID_ABOVE = 'B91C1C';

    private const string BID_BELOW = '1F8F5C';

    /** A:N mirrors the PDF grid's 14 columns; O:P carry the extra Item Category/Specialization data the PDF doesn't show. */
    private const string LAST_COLUMN = 'P';

    private const string LEFT_LABEL_RANGE = 'A:C';

    private const string LEFT_VALUE_RANGE = 'D:H';

    private const string RIGHT_LABEL_RANGE = 'I:K';

    private const string RIGHT_VALUE_RANGE = 'L:P';

    /**
     * @param  Collection<int, LoaItem>  $items
     * @param  Collection<int, LoaFinancialSecurity>  $financialSecurities
     */
    public function __construct(
        private readonly Loa $loa,
        private readonly Collection $items,
        private readonly Collection $financialSecurities,
    ) {}

    public function title(): string
    {
        return 'LOA Export';
    }

    /**
     * @return array<class-string, callable>
     */
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event): void {
                $this->build($event->sheet->getDelegate());
            },
        ];
    }

    private function build(Worksheet $sheet): void
    {
        $this->applyColumnWidths($sheet);

        $row = $this->writeLetterhead($sheet, 1);
        $row = $this->writeDetailsAndFinancialColumns($sheet, $row + 1);
        $row = $this->writeScopeOfWork($sheet, $row + 1);
        $row = $this->writeItemDetails($sheet, $row + 1);
        $this->writeStations($sheet, $row + 1);

        $sheet->setSelectedCells('A1');
    }

    private function applyColumnWidths(Worksheet $sheet): void
    {
        foreach ([
            'A' => 8, 'B' => 32, 'C' => 12, 'D' => 10, 'E' => 10, 'F' => 14,
            'G' => 9, 'H' => 15, 'I' => 16, 'J' => 15, 'K' => 9, 'L' => 16,
            'M' => 12, 'N' => 22, 'O' => 16, 'P' => 20,
        ] as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
    }

    private function writeCell(Worksheet $sheet, string $coordinate, string $value): void
    {
        $sheet->setCellValueExplicit($coordinate, $value, DataType::TYPE_STRING);
    }

    /**
     * @return int the next unused row
     */
    private function writeLetterhead(Worksheet $sheet, int $row): int
    {
        $sheet->mergeCells("A{$row}:H{$row}");
        $this->writeCell($sheet, "A{$row}", 'Rail ERP');
        $sheet->getStyle("A{$row}")->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 16, 'bold' => true, 'color' => ['rgb' => self::NAVY]],
        ]);

        $sheet->mergeCells('I'.$row.':'.self::LAST_COLUMN.$row);
        $this->writeCell($sheet, "I{$row}", 'Letter of Acceptance / Purchase Order');
        $sheet->getStyle("I{$row}")->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 8, 'bold' => false, 'color' => ['rgb' => self::MUTED_GRAY]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(24);

        $row++;

        $sheet->mergeCells("A{$row}:H{$row}");
        $this->writeCell($sheet, "A{$row}", 'Contract Management System');
        $sheet->getStyle("A{$row}")->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 8, 'color' => ['rgb' => self::MUTED_GRAY]],
        ]);

        $sheet->mergeCells('I'.$row.':'.self::LAST_COLUMN.$row);
        $this->writeCell($sheet, "I{$row}", (string) $this->loa->loa_number);
        $sheet->getStyle("I{$row}")->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 13, 'bold' => true, 'color' => ['rgb' => self::NAVY]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(18);

        $row++;

        $active = (bool) $this->loa->active_status;
        $sheet->mergeCells('I'.$row.':'.self::LAST_COLUMN.$row);
        $this->writeCell($sheet, "I{$row}", $active ? 'ACTIVE' : 'INACTIVE');
        $sheet->getStyle("I{$row}")->applyFromArray([
            'font' => [
                'name' => self::FONT,
                'size' => 8.5,
                'bold' => true,
                'color' => ['rgb' => $active ? self::STATUS_ACTIVE_TEXT : self::STATUS_INACTIVE_TEXT],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $active ? self::STATUS_ACTIVE_BG : self::STATUS_INACTIVE_BG],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(18);

        $sheet->getStyle('A'.$row.':'.self::LAST_COLUMN.$row)->getBorders()->getBottom()
            ->setBorderStyle(Border::BORDER_THICK)
            ->getColor()->setRGB(self::ORANGE_ACCENT);

        return $row;
    }

    private function sectionTitle(Worksheet $sheet, string $range, string $title): void
    {
        $sheet->mergeCells($range);
        $firstCell = explode(':', $range)[0];
        $this->writeCell($sheet, $firstCell, mb_strtoupper($title));
        $sheet->getStyle($range)->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 9, 'bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::NAVY]],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $rowNumber = (int) preg_replace('/\D/', '', $firstCell);
        $sheet->getRowDimension($rowNumber)->setRowHeight(20);
    }

    /**
     * A thin box border around a section's body — mirrors `.section-body`'s
     * `border: 1px solid #e2e7ee` card look in the PDF.
     */
    private function boxBorder(Worksheet $sheet, string $range): void
    {
        $sheet->getStyle($range)->getBorders()->getAllBorders()
            ->setBorderStyle(Border::BORDER_THIN)
            ->getColor()->setRGB(self::SECTION_BORDER);
    }

    /**
     * One label/value row of an "info" box — mirrors table.info's label
     * (uppercase gray caption) + value (bold navy) pairing in the PDF.
     */
    private function infoRow(
        Worksheet $sheet,
        int $row,
        string $labelRange,
        string $valueRange,
        string $label,
        string $value,
        ?string $valueColor = null,
    ): void {
        $labelCol1 = explode(':', $labelRange)[0];
        $labelCol2 = $labelRange[strpos($labelRange, ':') + 1] ?? $labelCol1;
        $valueCol1 = explode(':', $valueRange)[0];
        $valueCol2Letters = substr($valueRange, strpos($valueRange, ':') + 1);

        $labelMerge = "{$labelCol1}{$row}:{$labelCol2}{$row}";
        $valueMerge = "{$valueCol1}{$row}:{$valueCol2Letters}{$row}";

        $sheet->mergeCells($labelMerge);
        $this->writeCell($sheet, "{$labelCol1}{$row}", mb_strtoupper($label));
        $sheet->getStyle($labelMerge)->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 7, 'color' => ['rgb' => self::LABEL_GRAY]],
            'alignment' => ['vertical' => Alignment::VERTICAL_TOP, 'wrapText' => true],
        ]);

        $sheet->mergeCells($valueMerge);
        $this->writeCell($sheet, "{$valueCol1}{$row}", $value);
        $sheet->getStyle($valueMerge)->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 9.5, 'bold' => true, 'color' => ['rgb' => $valueColor ?? self::NAVY]],
            'alignment' => ['vertical' => Alignment::VERTICAL_TOP, 'wrapText' => true],
        ]);

        $sheet->getStyle("{$labelCol1}{$row}:{$valueCol2Letters}{$row}")->getBorders()->getBottom()
            ->setBorderStyle(Border::BORDER_THIN)->getColor()->setRGB('F0F3F7');
    }

    /**
     * @return int the next unused row
     */
    private function writeDetailsAndFinancialColumns(Worksheet $sheet, int $row): int
    {
        $leftEndRow = $this->writeLoaDetails($sheet, $row);
        $rightEndRow = $this->writeFinancialSecurityAndTeam($sheet, $row);

        return max($leftEndRow, $rightEndRow);
    }

    private function writeLoaDetails(Worksheet $sheet, int $row): int
    {
        $this->sectionTitle($sheet, "A{$row}:H{$row}", 'LOA Details');
        $row++;

        $loa = $this->loa;
        $daysToCompletion = $loa->completion_date
            ? now()->startOfDay()->diffInDays($loa->completion_date, false)
            : null;
        $completionUrgent = $daysToCompletion !== null && $daysToCompletion <= 30;
        $completionValue = optional($loa->completion_date)->format('d M Y') ?? '—';

        if ($completionUrgent) {
            $completionValue .= '  ['.($daysToCompletion < 0 ? 'OVERDUE' : 'DUE SOON').']';
        }

        $fields = [
            ['LOA Number', (string) $loa->loa_number, null],
            ['LOA Date', optional($loa->loa_date)->format('d M Y') ?? '—', null],
            ['Client', (string) $loa->client, null],
            ['Division', $loa->division?->name ?? '—', null],
            ['Work Type', (string) $loa->work_type, null],
            ['Contract Value', '₹'.number_format((float) $loa->contract_value_amount, 2).' '.$loa->contract_value_unit, null],
            ['Completion Period', $loa->completion_period_months.' Months', null],
            ['Defect Liability', $loa->defect_liability_months.' Months', null],
            ['Start Date', optional($loa->start_date)->format('d M Y') ?? '—', null],
            ['End Date', optional($loa->end_date)->format('d M Y') ?? '—', null],
            ['Total Stations', $loa->total_stations.' Stations', null],
            ['Completion Date', $completionValue, $completionUrgent ? self::URGENT_TEXT : null],
            ['Extension Date', optional($loa->extension_date)->format('d M Y') ?? '—', null],
        ];

        $bodyStartRow = $row;

        foreach ($fields as [$label, $value, $color]) {
            $this->infoRow($sheet, $row, self::LEFT_LABEL_RANGE, self::LEFT_VALUE_RANGE, $label, $value, $color);
            $row++;
        }

        $this->boxBorder($sheet, "A{$bodyStartRow}:H".($row - 1));

        return $row;
    }

    private function writeFinancialSecurityAndTeam(Worksheet $sheet, int $row): int
    {
        $this->sectionTitle($sheet, "I{$row}:".self::LAST_COLUMN.$row, 'Financial Security');
        $row++;
        $financialBodyStartRow = $row;

        $labels = [
            LoaFinancialSecurity::TYPE_EMD => 'EMD',
            LoaFinancialSecurity::TYPE_PERFORMANCE_BG => 'Performance BG',
            LoaFinancialSecurity::TYPE_SECURITY_BG => 'Security BG',
        ];

        foreach ($labels as $type => $label) {
            $security = $this->financialSecurities->firstWhere('security_type', $type);
            $this->writeFinancialSecurityRow($sheet, $row, $label, $security);
            $row++;
        }

        $this->boxBorder($sheet, "I{$financialBodyStartRow}:".self::LAST_COLUMN.($row - 1));

        $row++;

        $this->sectionTitle($sheet, "I{$row}:".self::LAST_COLUMN.$row, 'Project Team');
        $row++;
        $teamBodyStartRow = $row;

        if ($this->loa->teamMembers->isEmpty()) {
            $sheet->mergeCells("I{$row}:".self::LAST_COLUMN.$row);
            $this->writeCell($sheet, "I{$row}", 'No team members added.');
            $sheet->getStyle("I{$row}")->applyFromArray([
                'font' => ['name' => self::FONT, 'size' => 9.5, 'color' => ['rgb' => self::EMPTY_GRAY]],
            ]);
            $this->boxBorder($sheet, "I{$row}:".self::LAST_COLUMN.$row);

            return $row + 1;
        }

        foreach ($this->loa->teamMembers as $member) {
            $this->infoRow(
                $sheet,
                $row,
                self::RIGHT_LABEL_RANGE,
                self::RIGHT_VALUE_RANGE,
                (string) $member->role,
                (string) $member->name,
            );
            $row++;
        }

        $this->boxBorder($sheet, "I{$teamBodyStartRow}:".self::LAST_COLUMN.($row - 1));

        return $row;
    }

    private function writeFinancialSecurityRow(Worksheet $sheet, int $row, string $label, ?LoaFinancialSecurity $security): void
    {
        $labelCell = "I{$row}";
        $sheet->mergeCells("I{$row}:K{$row}");
        $this->writeCell($sheet, $labelCell, mb_strtoupper($label));
        $sheet->getStyle("I{$row}:K{$row}")->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 7, 'color' => ['rgb' => self::LABEL_GRAY]],
            'alignment' => ['vertical' => Alignment::VERTICAL_TOP],
        ]);

        $valueRange = "L{$row}:".self::LAST_COLUMN.$row;
        $sheet->mergeCells($valueRange);
        $valueCell = $sheet->getCell("L{$row}");

        if ($security === null) {
            $this->writeCell($sheet, "L{$row}", '—');
            $sheet->getStyle($valueRange)->applyFromArray([
                'font' => ['name' => self::FONT, 'size' => 9.5, 'bold' => true, 'color' => ['rgb' => self::NAVY]],
            ]);

            return;
        }

        $amountLine = '₹'.number_format((float) $security->amount, 2).' '.$security->amount_unit;
        $noteLine = (optional($security->validity_start_date)->format('d M Y') ?? '—')
            .' to '.(optional($security->validity_end_date)->format('d M Y') ?? '—')
            .' · '.$security->claim_period.' '.$security->claim_period_unit.' claim'
            .' · '.($security->bank->name ?? '—');

        $richText = new RichText;
        $amountRun = $richText->createTextRun($amountLine);
        $amountRun->getFont()->setName(self::FONT)->setSize(9.5)->setBold(true)->setColor(new Color(self::NAVY));
        $noteRun = $richText->createTextRun("\n{$noteLine}");
        $noteRun->getFont()->setName(self::FONT)->setSize(8)->setBold(false)->setColor(new Color(self::NOTE_GRAY));

        $valueCell->setValue($richText);
        $sheet->getStyle($valueRange)->applyFromArray([
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_TOP],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(28);
    }

    /**
     * @return int the next unused row
     */
    private function writeScopeOfWork(Worksheet $sheet, int $row): int
    {
        $this->sectionTitle($sheet, "A{$row}:".self::LAST_COLUMN.$row, 'Scope of Work');
        $row++;

        $range = "A{$row}:".self::LAST_COLUMN.$row;
        $sheet->mergeCells($range);
        $this->writeCell($sheet, "A{$row}", $this->loa->scope_of_work ?: '—');
        $sheet->getStyle($range)->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 9.5, 'color' => ['rgb' => '1C2A37']],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_TOP],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(60);
        $this->boxBorder($sheet, $range);

        return $row + 1;
    }

    /**
     * @return int the next unused row
     */
    private function writeItemDetails(Worksheet $sheet, int $row): int
    {
        $this->sectionTitle($sheet, "A{$row}:".self::LAST_COLUMN.$row, 'LOA Item Details');
        $row++;

        if ($this->items->isEmpty()) {
            $range = "A{$row}:".self::LAST_COLUMN.$row;
            $sheet->mergeCells($range);
            $this->writeCell($sheet, "A{$row}", 'No item details added.');
            $sheet->getStyle($range)->applyFromArray([
                'font' => ['name' => self::FONT, 'size' => 9.5, 'color' => ['rgb' => self::EMPTY_GRAY]],
            ]);
            $this->boxBorder($sheet, $range);

            return $row + 1;
        }

        $gridStartRow = $row;
        $overallScheduleLabel = collect([$this->loa->scheduleName?->name, $this->loa->scheduleType?->name])
            ->filter()->implode(' - ');

        if ($overallScheduleLabel !== '') {
            $range = "A{$row}:".self::LAST_COLUMN.$row;
            $sheet->mergeCells($range);
            $this->writeCell($sheet, "A{$row}", $overallScheduleLabel);
            $sheet->getStyle($range)->applyFromArray([
                'font' => ['name' => self::FONT, 'size' => 9.5, 'bold' => true, 'color' => ['rgb' => self::CAPTION_TEXT]],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::CAPTION_BG]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet->getStyle("A{$row}")->getBorders()->getLeft()
                ->setBorderStyle(Border::BORDER_THICK)->getColor()->setRGB(self::CAPTION_BORDER);
            $sheet->getRowDimension($row)->setRowHeight(18);
            $row++;
        }

        $headers = [
            'Item S.no', 'Item Desc', 'Item Code', 'Item Qty', 'Qty Unit',
            'Unit Rate (Rs)', 'Escl. (%)', 'Advt. Value (Rs)', 'Bid Rate/ Unit Rate',
            'Bid Amount (Rs)', 'Rebate %', 'Final Bid Amount (Rs)', 'Inspection By',
            'Payment Type', 'Item Category', 'Specialization File',
        ];
        $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

        foreach ($columns as $index => $column) {
            $this->writeCell($sheet, "{$column}{$row}", $headers[$index]);
        }
        $sheet->getStyle("A{$row}:".self::LAST_COLUMN.$row)->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 8, 'bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::NAVY]],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(20);
        $sheet->freezePane('A'.($row + 1));
        $row++;

        $scheduleGroups = $this->items->groupBy(
            fn (LoaItem $item) => ($item->schedule_name_id ?? 'none').'-'.($item->schedule_type_id ?? 'none'),
        );

        foreach ($scheduleGroups as $groupItems) {
            $row = $this->writeScheduleGroup($sheet, $row, $groupItems);
        }

        $this->boxBorder($sheet, "A{$gridStartRow}:".self::LAST_COLUMN.($row - 1));

        return $row;
    }

    /**
     * @param  Collection<int, LoaItem>  $groupItems
     * @return int the next unused row
     */
    private function writeScheduleGroup(Worksheet $sheet, int $row, Collection $groupItems): int
    {
        $groupFirst = $groupItems->first();
        $groupLabel = collect([$groupFirst->scheduleName?->name, $groupFirst->scheduleType?->name])
            ->filter()->implode(' - ');
        $groupLabel = $groupLabel !== '' ? $groupLabel : 'Unassigned Items';
        $groupAdvertisedValue = $groupItems->sum(fn (LoaItem $item) => (float) $item->advertised_value);
        $groupBidAmount = $groupItems->sum(fn (LoaItem $item) => (float) $item->bid_amount);

        $row = $this->writeScheduleDividerRow($sheet, $row, "Schedule {$groupLabel}", $groupAdvertisedValue, $groupBidAmount, self::SCHEDULE_ROW_BG, self::SCHEDULE_ROW_TEXT, self::SCHEDULE_ROW_BORDER);

        foreach ($groupItems->values() as $index => $item) {
            $this->writeItemRow($sheet, $row, $index, $item);
            $row++;
        }

        return $this->writeScheduleDividerRow($sheet, $row, 'Schedule Totals', $groupAdvertisedValue, $groupBidAmount, self::SCHEDULE_TOTAL_BG, self::NAVY, self::SCHEDULE_TOTAL_BORDER);
    }

    private function writeScheduleDividerRow(
        Worksheet $sheet,
        int $row,
        string $label,
        float $advertisedValue,
        float $bidAmount,
        string $background,
        string $textColor,
        string $borderColor,
    ): int {
        $sheet->mergeCells("A{$row}:G{$row}");
        $this->writeCell($sheet, "A{$row}", $label);
        $this->writeCell($sheet, "H{$row}", '₹'.number_format($advertisedValue, 2));
        $this->writeCell($sheet, "J{$row}", '₹'.number_format($bidAmount, 2));

        $sheet->getStyle("A{$row}:".self::LAST_COLUMN.$row)->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 8.5, 'bold' => true, 'color' => ['rgb' => $textColor]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $background]],
            'borders' => [
                'top' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $borderColor]],
                'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $borderColor]],
            ],
        ]);
        $sheet->getStyle("H{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("J{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getRowDimension($row)->setRowHeight(18);

        return $row + 1;
    }

    private function writeItemRow(Worksheet $sheet, int $row, int $index, LoaItem $item): void
    {
        $numericColumns = ['D', 'F', 'H', 'I', 'J', 'K', 'L'];
        $values = [
            'A' => (string) ($index + 1),
            'B' => (string) $item->item_description,
            'C' => (string) ($item->item_code ?? '—'),
            'D' => number_format((float) $item->item_quantity, 3),
            'E' => (string) $item->quantity_unit,
            'F' => '₹'.number_format((float) $item->unit_rate, 2),
            'G' => $item->escalation !== null ? number_format((float) $item->escalation, 2).'%' : '—',
            'H' => '₹'.number_format((float) $item->advertised_value, 2),
            'J' => '₹'.number_format((float) $item->bid_amount, 2),
            'K' => $item->rebate_enabled ? number_format((float) $item->rebate_percentage, 2).'%' : '—',
            'L' => '₹'.number_format((float) $item->final_bid_amount, 2),
            'M' => (string) ($item->inspection_by ?? '—'),
            'N' => $this->formatPaymentStages($item->payment_stages),
            'O' => (string) ($item->item_category ?? '—'),
            'P' => (string) ($item->specialization_original_file_name ?? '—'),
        ];

        foreach ($values as $column => $value) {
            $this->writeCell($sheet, "{$column}{$row}", $value);
        }

        $this->writeBidRateCell($sheet, "I{$row}", $item);

        $isOdd = $index % 2 === 1;
        $sheet->getStyle("A{$row}:".self::LAST_COLUMN.$row)->applyFromArray([
            'font' => ['name' => self::FONT, 'size' => 8.5, 'color' => ['rgb' => '1C2A37']],
            'fill' => $isOdd
                ? ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => self::ROW_ODD_BG]]
                : ['fillType' => Fill::FILL_NONE],
            'borders' => ['bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => self::ROW_BORDER]]],
            'alignment' => ['vertical' => Alignment::VERTICAL_TOP, 'wrapText' => true],
        ]);

        foreach ($numericColumns as $column) {
            $sheet->getStyle("{$column}{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        }

        $sheet->getRowDimension($row)->setRowHeight($item->bid_rate_unit ? 28 : 16);
    }

    private function writeBidRateCell(Worksheet $sheet, string $coordinate, LoaItem $item): void
    {
        $rateLine = '₹'.number_format((float) $item->bid_rate, 2);

        if (! $item->bid_rate_unit) {
            $this->writeCell($sheet, $coordinate, $rateLine);

            return;
        }

        $unitColor = $item->bid_rate_unit === '% Above' ? self::BID_ABOVE : self::BID_BELOW;
        $percentLine = number_format((float) $item->bid_percentage_value, 4).$item->bid_rate_unit;

        $richText = new RichText;
        $rateRun = $richText->createTextRun($rateLine);
        $rateRun->getFont()->setName(self::FONT)->setSize(8.5)->setColor(new Color('1C2A37'));
        $percentRun = $richText->createTextRun("\n{$percentLine}");
        $percentRun->getFont()->setName(self::FONT)->setSize(8)->setBold(true)->setColor(new Color($unitColor));

        $sheet->getCell($coordinate)->setValue($richText);
    }

    /**
     * @param  array<string, string>|null  $stages
     */
    private function formatPaymentStages(?array $stages): string
    {
        $parts = [];

        foreach (PaymentStages::KEYS as $key) {
            if (! empty($stages[$key])) {
                $parts[] = "{$key} {$stages[$key]}";
            }
        }

        return $parts !== [] ? implode(', ', $parts) : '—';
    }

    private function writeStations(Worksheet $sheet, int $row): void
    {
        $this->sectionTitle($sheet, "A{$row}:".self::LAST_COLUMN.$row, 'Stations');
        $row++;

        $range = "A{$row}:".self::LAST_COLUMN.$row;
        $sheet->mergeCells($range);

        $names = $this->loa->stations
            ->map(fn ($loaStation) => $loaStation->station->station_name)
            ->implode(', ');

        $this->writeCell($sheet, "A{$row}", $names !== '' ? $names : 'No stations added.');
        $sheet->getStyle($range)->applyFromArray([
            'font' => [
                'name' => self::FONT,
                'size' => 9.5,
                'color' => ['rgb' => $names !== '' ? '1C2A37' : self::EMPTY_GRAY],
            ],
            'alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_TOP],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(30);
        $this->boxBorder($sheet, $range);
    }
}
