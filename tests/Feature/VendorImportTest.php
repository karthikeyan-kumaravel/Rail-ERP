<?php

use App\Models\District;
use App\Models\State;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

/**
 * @param  array<int, array<string, string>>  $rows
 */
function buildVendorImportFile(array $rows): UploadedFile
{
    $headings = [
        'Company Name *', 'Name *', 'Contact No *', 'Alternate Contact No', 'Mail ID',
        'GST No', 'PAN No *', 'Pincode *', 'State', 'District', 'Zone Name',
        'Bank Name *', 'Branch Name', 'Account No *', 'IFSC Code *', 'Account Holder Name *',
        'Address *', 'User Name', 'Status',
    ];
    $keys = [
        'company_name', 'name', 'contact_no', 'alternate_contact_no', 'email',
        'gst_no', 'pan_no', 'pincode', 'state', 'district', 'zone_name',
        'bank_name', 'branch_name', 'account_no', 'ifsc_code', 'account_holder_name',
        'address', 'username', 'status',
    ];

    $spreadsheet = new Spreadsheet;
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->fromArray($headings, null, 'A1');

    foreach ($rows as $rowIndex => $row) {
        $values = array_map(fn ($key) => $row[$key] ?? '', $keys);
        $sheet->fromArray($values, null, 'A'.($rowIndex + 2));
    }

    $path = tempnam(sys_get_temp_dir(), 'vendor-import').'.xlsx';
    (new Xlsx($spreadsheet))->save($path);

    return new UploadedFile($path, 'vendors.xlsx', null, null, true);
}

test('the vendor import template can be downloaded', function () {
    $response = $this->get('/admin/imports/vendors/template');

    $response->assertOk();
});

test('re-uploading the downloaded template only reads the data sheet, not the instructions sheet', function () {
    $templateResponse = $this->get('/admin/imports/vendors/template');
    $templateResponse->assertOk();

    $path = tempnam(sys_get_temp_dir(), 'vendor-template-roundtrip').'.xlsx';
    file_put_contents($path, $templateResponse->streamedContent());
    $file = new UploadedFile($path, 'vendor-template.xlsx', null, null, true);

    $preview = $this->postJson('/admin/imports/vendors/preview', ['file' => $file]);

    $preview->assertOk();
    // The template contains exactly 2 sample rows on the data sheet; if the
    // "Instructions" sheet were also read (the bug this test guards against),
    // total_records would balloon well past 2.
    $preview->assertJsonPath('summary.total_records', 2);

    $rows = $preview->json('rows');
    expect(collect($rows)->pluck('values.company_name'))
        ->toContain('Acme Traders Pvt Ltd')
        ->toContain('Kochi Hardware Suppliers');
});

test('a valid vendor row previews and commits successfully', function () {
    $state = State::factory()->create(['name' => 'Tamil Nadu']);
    $district = District::factory()->create(['state_id' => $state->id, 'name' => 'Chennai']);

    $file = buildVendorImportFile([[
        'company_name' => 'Acme Traders Pvt Ltd',
        'name' => 'Rajesh Kumar',
        'contact_no' => '9876543210',
        'gst_no' => '33ABCDE1234F1Z5',
        'pan_no' => 'abcde1234f',
        'pincode' => '600001',
        'state' => 'Tamil Nadu',
        'district' => 'Chennai',
        'zone_name' => 'Chennai',
        'bank_name' => 'State Bank of India',
        'account_no' => '123456789012',
        'ifsc_code' => 'sbin0001234',
        'account_holder_name' => 'Rajesh Kumar',
        'address' => '12 Main Street, Chennai',
        'username' => 'acme_traders',
        'status' => 'Active',
    ]]);

    $preview = $this->postJson('/admin/imports/vendors/preview', ['file' => $file]);
    $preview->assertOk();
    $preview->assertJsonPath('summary.preview_valid_records', 1);
    $preview->assertJsonPath('summary.failed_records', 0);

    $token = $preview->json('token');

    $commit = $this->postJson('/admin/imports/vendors/store', ['token' => $token]);
    $commit->assertOk();
    $commit->assertJsonPath('summary.successfully_imported', 1);

    $vendor = Vendor::query()->where('company_name', 'Acme Traders Pvt Ltd')->firstOrFail();

    expect($vendor->pan_no)->toBe('ABCDE1234F')
        ->and($vendor->ifsc_code)->toBe('SBIN0001234')
        ->and($vendor->state_id)->toBe($state->id)
        ->and($vendor->district_id)->toBe($district->id)
        ->and($vendor->pan_proof_path)->toBeNull()
        ->and($vendor->bank_proof_path)->toBeNull()
        ->and($vendor->password)->toBeNull()
        ->and($vendor->unique_id)->not->toBeNull();
});

test('a vendor row with an invalid pan number fails preview', function () {
    $file = buildVendorImportFile([[
        'company_name' => 'Acme Traders Pvt Ltd',
        'name' => 'Rajesh Kumar',
        'contact_no' => '9876543210',
        'pan_no' => 'INVALID',
        'pincode' => '600001',
        'bank_name' => 'State Bank of India',
        'account_no' => '123456789012',
        'ifsc_code' => 'SBIN0001234',
        'account_holder_name' => 'Rajesh Kumar',
        'address' => '12 Main Street, Chennai',
        'status' => 'Active',
    ]]);

    $preview = $this->postJson('/admin/imports/vendors/preview', ['file' => $file]);
    $preview->assertOk();
    $preview->assertJsonPath('summary.preview_valid_records', 0);
    $preview->assertJsonPath('summary.failed_records', 1);
});

test('a vendor row is skipped as a duplicate when the pan number already exists', function () {
    Vendor::factory()->create(['pan_no' => 'ABCDE1234F']);

    $file = buildVendorImportFile([[
        'company_name' => 'Another Traders',
        'name' => 'Someone Else',
        'contact_no' => '9000000000',
        'pan_no' => 'abcde1234f',
        'pincode' => '600001',
        'bank_name' => 'State Bank of India',
        'account_no' => '123456789012',
        'ifsc_code' => 'SBIN0001234',
        'account_holder_name' => 'Someone Else',
        'address' => '12 Main Street, Chennai',
        'status' => 'Active',
    ]]);

    $preview = $this->postJson('/admin/imports/vendors/preview', ['file' => $file]);
    $preview->assertOk();
    $preview->assertJsonPath('summary.preview_valid_records', 0);
    $preview->assertJsonPath('summary.duplicate_records', 1);
});

test('a vendor row leaves district blank when state is not provided', function () {
    $file = buildVendorImportFile([[
        'company_name' => 'No State Traders',
        'name' => 'Rajesh Kumar',
        'contact_no' => '9876543211',
        'pan_no' => 'ABCDE1234F',
        'pincode' => '600001',
        'district' => 'Chennai',
        'bank_name' => 'State Bank of India',
        'account_no' => '123456789012',
        'ifsc_code' => 'SBIN0001234',
        'account_holder_name' => 'Rajesh Kumar',
        'address' => '12 Main Street, Chennai',
        'status' => 'Active',
    ]]);

    $preview = $this->postJson('/admin/imports/vendors/preview', ['file' => $file]);
    $preview->assertOk();
    $preview->assertJsonPath('summary.preview_valid_records', 0);
    $preview->assertJsonPath('summary.failed_records', 1);
});
