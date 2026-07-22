<?php

use App\Models\Division;
use App\Models\Engineer;
use App\Models\EngineerType;
use App\Models\Loa;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

/**
 * Build a real workbook matching the column layout supplied for LOA items.
 *
 * @param  array<int, string>  $headerOverrides
 */
function buildScreenshotStyleLoaItemWorkbook(array $headerOverrides = [], bool $includeSecondSheet = false): UploadedFile
{
    $headers = array_replace([
        "Item\nSho.",
        'Item Desc',
        "Item\nCode",
        "Item\nQty",
        "Qty\nUnit",
        "Unit\nRate(Rs)",
        "Escl.\n(%)",
        "Advt.Value\n(Rs)",
        "Bid Rate/ Unit\nRate",
        "Bid Amount\n(Rs)",
    ], $headerOverrides);

    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('LOA Items');

    $writeSheet = static function (Worksheet $target, array $sheetHeaders, string $itemNo, string $itemCode): void {
        $target->fromArray($sheetHeaders, null, 'A1');
        $target->mergeCells('A2:G2');
        $target->setCellValue('A2', 'Schedule A-NON SOR Items (Item Directory - Not Applicable)');
        $target->setCellValue('H2', 100123876.97);

        $target->setCellValueExplicit('A3', $itemNo, DataType::TYPE_STRING);
        $target->setCellValue(
            'B3',
            'Supply, Installation, Testing and Commissioning of servers to work as IP-PBX.'
        );
        $target->setCellValue('C3', $itemCode);
        $target->setCellValue('D3', 20);
        $target->setCellValue('E3', 'Numbers');
        $target->setCellValue('F3', 227330.00);
        $target->setCellValue('G3', 'At Par');
        $target->setCellValue('H3', 4546600.00);
        $target->setCellValue('I3', '300475.54 Rs/Unit');
        $target->setCellValue('J3', 6009510.80);
    };

    $writeSheet($sheet, $headers, '01', 'NS 01');

    if ($includeSecondSheet) {
        $ignoredSheet = $spreadsheet->createSheet();
        $ignoredSheet->setTitle('Ignored Items');
        $writeSheet($ignoredSheet, $headers, '99', 'IGNORED 99');
    }

    $spreadsheet->setActiveSheetIndex(0);

    $temporaryFile = tempnam(sys_get_temp_dir(), 'loa-item-import-');

    if ($temporaryFile === false) {
        throw new RuntimeException('Unable to create a temporary LOA item workbook.');
    }

    $path = $temporaryFile.'.xlsx';
    unlink($temporaryFile);
    (new Xlsx($spreadsheet))->save($path);
    $spreadsheet->disconnectWorksheets();

    return new UploadedFile(
        $path,
        'loa-items.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true,
    );
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validLoaPayloadForItemImportFeature(int $divisionId, array $overrides = []): array
{
    $engineerType = EngineerType::factory()->create();
    $engineer = Engineer::factory()->create(['engineer_type_id' => $engineerType->id]);

    return array_merge([
        'loa_number' => 'RAILWAY/ITEMS/2026/001',
        'client' => 'Southern Railway',
        'division_id' => $divisionId,
        'work_type' => 'Telecommunication Works',
        'contract_value_amount' => 50.5,
        'contract_value_unit' => 'Cr',
        'completion_period_months' => 18,
        'defect_liability_months' => 12,
        'start_date' => '2026-01-01',
        'end_date' => '2027-06-30',
        'total_stations' => 10,
        'bg_amount' => 5.5,
        'bg_amount_unit' => 'L',
        'bg_validity' => '2027-12-31',
        'security_deposit_amount' => 2.5,
        'security_deposit_unit' => 'L',
        'mobilization_advance_amount' => 1.5,
        'mobilization_advance_unit' => 'L',
        'mobilization_advance_status' => 'Pending',
        'scope_of_work' => 'Supply and commissioning of telecommunications equipment.',
        'active_status' => '1',
        'team' => [
            [
                'engineer_id' => $engineer->id,
                'engineer_type_id' => $engineerType->id,
                'name' => 'Alice',
                'role' => 'Project Manager',
            ],
        ],
        'items' => [[
            'schedule_name' => 'Schedule A-NON SOR Items (Item Directory - Not Applicable)',
            'schedule_advertised_value' => 100123876.97,
            'item_no' => '01',
            'item_description' => 'Supply, Installation, Testing and Commissioning of servers to work as IP-PBX.',
            'item_code' => 'NS 01',
            'item_quantity' => 20,
            'quantity_unit' => 'Numbers',
            'unit_rate' => 227330.00,
            'escalation' => 0,
            'advertised_value' => 4546600.00,
            'bid_rate' => 300475.54,
            'bid_rate_unit' => '% Above',
            'bid_amount' => 6009510.80,
        ]],
    ], $overrides);
}

test('a screenshot-style LOA item workbook is parsed and sheets after the first are ignored', function () {
    $response = $this->postJson('/admin/loas/items/import-preview', [
        'file' => buildScreenshotStyleLoaItemWorkbook(includeSecondSheet: true),
    ]);

    $response->assertOk()
        ->assertJsonPath('summary.imported_rows', 1)
        ->assertJsonPath('summary.skipped_rows', 0)
        ->assertJsonPath('summary.header_row', 1)
        ->assertJsonCount(1, 'items');

    $item = $response->json('items.0');

    expect($item)
        ->toMatchArray([
            'schedule_name' => 'Schedule A-NON SOR Items (Item Directory - Not Applicable)',
            'item_no' => '01',
            'item_description' => 'Supply, Installation, Testing and Commissioning of servers to work as IP-PBX.',
            'item_code' => 'NS 01',
            'quantity_unit' => 'Numbers',
            'escalation' => null,
            'bid_rate_unit' => null,
        ])
        ->and((float) $item['schedule_advertised_value'])->toBe(100123876.97)
        ->and((float) $item['item_quantity'])->toBe(20.0)
        ->and((float) $item['unit_rate'])->toBe(227330.0)
        ->and((float) $item['advertised_value'])->toBe(4546600.0)
        ->and((float) $item['bid_rate'])->toBe(300475.54)
        ->and((float) $item['bid_amount'])->toBe(6009510.80);

    expect(collect($response->json('items'))->pluck('item_code')->all())
        ->not->toContain('IGNORED 99');
});

test('a workbook missing a required LOA item heading is rejected', function () {
    $response = $this->postJson('/admin/loas/items/import-preview', [
        'file' => buildScreenshotStyleLoaItemWorkbook([2 => 'Unexpected Column']),
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('file');
});

test('a non-Excel LOA item import is rejected', function () {
    $response = $this->postJson('/admin/loas/items/import-preview', [
        'file' => UploadedFile::fake()->createWithContent('loa-items.txt', 'not an Excel workbook'),
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors('file');
});

test('an LOA can persist the nested items returned by import preview', function () {
    $division = Division::factory()->create();

    $preview = $this->postJson('/admin/loas/items/import-preview', [
        'file' => buildScreenshotStyleLoaItemWorkbook(),
    ]);

    $preview->assertOk();

    $response = $this->post('/admin/loas', validLoaPayloadForItemImportFeature($division->id, [
        'items' => $preview->json('items'),
    ]));

    $response->assertRedirect('/admin/loas');

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ITEMS/2026/001')->firstOrFail();
    $this->assertDatabaseCount('loa_items', 1);

    $item = DB::table('loa_items')->where('loa_id', $loa->id)->sole();

    expect($item->schedule_name)->toBe('Schedule A-NON SOR Items (Item Directory - Not Applicable)')
        ->and((float) $item->schedule_advertised_value)->toBe(100123876.97)
        ->and($item->item_no)->toBe('01')
        ->and($item->item_description)->toBe('Supply, Installation, Testing and Commissioning of servers to work as IP-PBX.')
        ->and($item->item_code)->toBe('NS 01')
        ->and((float) $item->item_quantity)->toBe(20.0)
        ->and($item->quantity_unit)->toBe('Numbers')
        ->and((float) $item->unit_rate)->toBe(227330.0)
        ->and($item->escalation)->toBeNull()
        ->and((float) $item->advertised_value)->toBe(4546600.0)
        ->and((float) $item->bid_rate)->toBe(300475.54)
        ->and($item->bid_rate_unit)->toBeNull()
        ->and((float) $item->bid_amount)->toBe(6009510.80)
        ->and($item->order_no)->toBe(0);
});

test('updating an LOA keeps the edited item that remains and deletes its sibling', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);
    $timestamp = now();

    DB::table('loa_items')->insert([
        [
            'loa_id' => $loa->id,
            'schedule_name' => 'Schedule A',
            'schedule_advertised_value' => 1000,
            'item_no' => '01',
            'item_description' => 'Sibling that will be removed',
            'item_code' => 'NS 01',
            'item_quantity' => 2,
            'quantity_unit' => 'Numbers',
            'unit_rate' => 100,
            'escalation' => 0,
            'advertised_value' => 200,
            'bid_rate' => 110,
            'bid_rate_unit' => '% Above',
            'bid_amount' => 220,
            'order_no' => 0,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ],
        [
            'loa_id' => $loa->id,
            'schedule_name' => 'Schedule B',
            'schedule_advertised_value' => 500,
            'item_no' => '02',
            'item_description' => 'Second item before edit',
            'item_code' => 'NS 02',
            'item_quantity' => 5,
            'quantity_unit' => 'Sets',
            'unit_rate' => 100,
            'escalation' => 0,
            'advertised_value' => 500,
            'bid_rate' => 110,
            'bid_rate_unit' => '% Below',
            'bid_amount' => 550,
            'order_no' => 1,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ],
    ]);

    $remainingEditedItem = [
        'schedule_name' => 'Schedule B - Revised',
        'schedule_advertised_value' => 875,
        'item_no' => '02',
        'item_description' => 'Second item after edit',
        'item_code' => 'NS 02-REV',
        'item_quantity' => 7,
        'quantity_unit' => 'Sets',
        'unit_rate' => 125,
        'escalation' => 0,
        'advertised_value' => 875,
        'bid_rate' => 130,
        'bid_rate_unit' => '% Below',
        'bid_amount' => 910,
    ];

    $response = $this->put("/admin/loas/{$loa->unique_id}", validLoaPayloadForItemImportFeature($division->id, [
        'loa_number' => $loa->loa_number,
        'items' => [$remainingEditedItem],
    ]));

    $response->assertRedirect('/admin/loas');
    $this->assertDatabaseCount('loa_items', 1);
    $this->assertDatabaseMissing('loa_items', [
        'loa_id' => $loa->id,
        'item_code' => 'NS 01',
    ]);

    $item = DB::table('loa_items')->where('loa_id', $loa->id)->sole();

    expect($item->schedule_name)->toBe('Schedule B - Revised')
        ->and((float) $item->schedule_advertised_value)->toBe(875.0)
        ->and($item->item_no)->toBe('02')
        ->and($item->item_description)->toBe('Second item after edit')
        ->and($item->item_code)->toBe('NS 02-REV')
        ->and((float) $item->item_quantity)->toBe(7.0)
        ->and((float) $item->bid_rate)->toBe(130.0)
        ->and($item->bid_rate_unit)->toBe('% Below')
        ->and((float) $item->bid_amount)->toBe(910.0)
        ->and($item->order_no)->toBe(0);
});
