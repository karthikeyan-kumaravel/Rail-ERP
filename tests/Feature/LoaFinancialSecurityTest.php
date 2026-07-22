<?php

use App\Models\Bank;
use App\Models\Division;
use App\Models\Loa;
use App\Models\LoaFinancialSecurity;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
});

test('an loa can be created with emd, performance bg, and security bg records', function () {
    $division = Division::factory()->create();
    $bank = Bank::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'financial_securities' => validFinancialSecuritiesPayload($bank->id),
    ]));

    $response->assertRedirect('/admin/loas');
    $response->assertSessionDoesntHaveErrors();

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();

    $this->assertDatabaseCount('loa_financial_securities', 3);

    $emd = $loa->financialSecurities()->where('security_type', 'emd')->firstOrFail();

    expect($emd->bank_id)->toBe($bank->id)
        ->and((float) $emd->amount)->toBe(5.5)
        ->and($emd->file_path)->not->toBeNull();

    Storage::disk('public')->assertExists($emd->file_path);
});

test('a zero or negative amount is rejected', function () {
    $division = Division::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'financial_securities' => validFinancialSecuritiesPayload(null, ['emd' => ['amount' => 0]]),
    ]));

    $response->assertSessionHasErrors('financial_securities.emd.amount');
});

test('a validity end date before the start date is rejected', function () {
    $division = Division::factory()->create();
    $bank = Bank::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'financial_securities' => [
            'emd' => financialSecuritySectionPayload($bank->id, [
                'validity_start_date' => '2026-06-01',
                'validity_end_date' => '2026-01-01',
            ]),
            'performance_bg' => financialSecuritySectionPayload($bank->id),
            'security_bg' => financialSecuritySectionPayload($bank->id),
        ],
    ]));

    $response->assertSessionHasErrors('financial_securities.emd.validity_end_date');
});

test('a missing bank is rejected', function () {
    $division = Division::factory()->create();
    $bank = Bank::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'financial_securities' => [
            'emd' => financialSecuritySectionPayload($bank->id, ['bank_id' => null]),
            'performance_bg' => financialSecuritySectionPayload($bank->id),
            'security_bg' => financialSecuritySectionPayload($bank->id),
        ],
    ]));

    $response->assertSessionHasErrors('financial_securities.emd.bank_id');
});

test('a missing document is rejected when uploads are configured as mandatory', function () {
    config(['loa.financial_security_document_required' => true]);

    $division = Division::factory()->create();
    $bank = Bank::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'financial_securities' => [
            'emd' => financialSecuritySectionPayload($bank->id, ['file' => null]),
            'performance_bg' => financialSecuritySectionPayload($bank->id),
            'security_bg' => financialSecuritySectionPayload($bank->id),
        ],
    ]));

    $response->assertSessionHasErrors('financial_securities.emd.file');
});

test('a missing document is accepted when uploads are configured as optional', function () {
    config(['loa.financial_security_document_required' => false]);

    $division = Division::factory()->create();
    $bank = Bank::factory()->create();

    $response = $this->post('/admin/loas', validLoaPayload($division->id, [
        'financial_securities' => [
            'emd' => financialSecuritySectionPayload($bank->id, ['file' => null]),
            'performance_bg' => financialSecuritySectionPayload($bank->id, ['file' => null]),
            'security_bg' => financialSecuritySectionPayload($bank->id, ['file' => null]),
        ],
    ]));

    $response->assertSessionDoesntHaveErrors();
});

test('replacing a document deletes the previous file', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);
    $bank = Bank::factory()->create();

    $originalFile = UploadedFile::fake()->create('original.pdf', 100, 'application/pdf');
    $this->put("/admin/loas/{$loa->unique_id}", validLoaPayload($division->id, [
        'loa_number' => $loa->loa_number,
        'financial_securities' => [
            'emd' => financialSecuritySectionPayload($bank->id, ['file' => $originalFile]),
            'performance_bg' => financialSecuritySectionPayload($bank->id),
            'security_bg' => financialSecuritySectionPayload($bank->id),
        ],
    ]));

    $originalPath = $loa->financialSecurities()->where('security_type', 'emd')->firstOrFail()->file_path;
    Storage::disk('public')->assertExists($originalPath);

    $replacementFile = UploadedFile::fake()->create('replacement.pdf', 100, 'application/pdf');
    $this->put("/admin/loas/{$loa->unique_id}", validLoaPayload($division->id, [
        'loa_number' => $loa->loa_number,
        'financial_securities' => [
            'emd' => financialSecuritySectionPayload($bank->id, ['file' => $replacementFile]),
            'performance_bg' => financialSecuritySectionPayload($bank->id),
            'security_bg' => financialSecuritySectionPayload($bank->id),
        ],
    ]));

    $emd = $loa->financialSecurities()->where('security_type', 'emd')->firstOrFail();

    Storage::disk('public')->assertMissing($originalPath);
    Storage::disk('public')->assertExists($emd->file_path);
    expect($emd->original_file_name)->toBe('replacement.pdf');
});

test('saving without a new upload keeps the existing file', function () {
    config(['loa.financial_security_document_required' => false]);

    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);
    $bank = Bank::factory()->create();

    $originalFile = UploadedFile::fake()->create('kept.pdf', 100, 'application/pdf');
    $this->put("/admin/loas/{$loa->unique_id}", validLoaPayload($division->id, [
        'loa_number' => $loa->loa_number,
        'financial_securities' => [
            'emd' => financialSecuritySectionPayload($bank->id, ['file' => $originalFile]),
            'performance_bg' => financialSecuritySectionPayload($bank->id),
            'security_bg' => financialSecuritySectionPayload($bank->id),
        ],
    ]));

    $originalPath = $loa->financialSecurities()->where('security_type', 'emd')->firstOrFail()->file_path;

    $this->put("/admin/loas/{$loa->unique_id}", validLoaPayload($division->id, [
        'loa_number' => $loa->loa_number,
        'financial_securities' => [
            'emd' => financialSecuritySectionPayload($bank->id, ['file' => null]),
            'performance_bg' => financialSecuritySectionPayload($bank->id),
            'security_bg' => financialSecuritySectionPayload($bank->id),
        ],
    ]));

    $emd = $loa->financialSecurities()->where('security_type', 'emd')->firstOrFail();

    expect($emd->file_path)->toBe($originalPath);
    Storage::disk('public')->assertExists($originalPath);
});

test('removing a document clears the stored file', function () {
    config(['loa.financial_security_document_required' => false]);

    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);
    $bank = Bank::factory()->create();

    $originalFile = UploadedFile::fake()->create('remove-me.pdf', 100, 'application/pdf');
    $this->put("/admin/loas/{$loa->unique_id}", validLoaPayload($division->id, [
        'loa_number' => $loa->loa_number,
        'financial_securities' => [
            'emd' => financialSecuritySectionPayload($bank->id, ['file' => $originalFile]),
            'performance_bg' => financialSecuritySectionPayload($bank->id),
            'security_bg' => financialSecuritySectionPayload($bank->id),
        ],
    ]));

    $originalPath = $loa->financialSecurities()->where('security_type', 'emd')->firstOrFail()->file_path;

    $this->put("/admin/loas/{$loa->unique_id}", validLoaPayload($division->id, [
        'loa_number' => $loa->loa_number,
        'financial_securities' => [
            'emd' => financialSecuritySectionPayload($bank->id, ['file' => null, 'remove_file' => true]),
            'performance_bg' => financialSecuritySectionPayload($bank->id),
            'security_bg' => financialSecuritySectionPayload($bank->id),
        ],
    ]));

    $emd = $loa->financialSecurities()->where('security_type', 'emd')->firstOrFail();

    expect($emd->file_path)->toBeNull()
        ->and($emd->original_file_name)->toBeNull();
    Storage::disk('public')->assertMissing($originalPath);
});

test('the show page includes financial security details with the bank name', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id]);
    $bank = Bank::factory()->create(['name' => 'HDFC Bank']);
    LoaFinancialSecurity::factory()->create([
        'loa_id' => $loa->id,
        'security_type' => 'emd',
        'bank_id' => $bank->id,
    ]);

    $response = $this->get("/admin/loas/{$loa->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('loa.financial_securities.emd.bank', 'HDFC Bank'));
});
