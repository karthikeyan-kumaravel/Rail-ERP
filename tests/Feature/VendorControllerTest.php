<?php

use App\Models\District;
use App\Models\State;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->actingAs(User::factory()->create());
});

function validVendorPayload(array $overrides = []): array
{
    return array_merge([
        'company_name' => 'Acme Traders Pvt Ltd',
        'name' => 'Rajesh Kumar',
        'contact_no' => '9876543210',
        'alternate_contact_no' => '9876500000',
        'email' => 'vendor@example.com',
        'gst_no' => '33ABCDE1234F1Z5',
        'pan_no' => 'ABCDE1234F',
        'pan_proof' => UploadedFile::fake()->create('pan.pdf', 100, 'application/pdf'),
        'pincode' => '600001',
        'zone_name' => 'Chennai',
        'bank_name' => 'State Bank of India',
        'branch_name' => 'Anna Salai',
        'account_no' => '123456789012',
        'ifsc_code' => 'SBIN0001234',
        'account_holder_name' => 'Rajesh Kumar',
        'bank_proof' => UploadedFile::fake()->create('bank.pdf', 100, 'application/pdf'),
        'address' => '12 Main Street, Chennai',
        'username' => 'acme_traders',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'active_status' => '1',
    ], $overrides);
}

test('a vendor can be created with proof documents and login credentials', function () {
    $state = State::factory()->create();
    $district = District::factory()->create(['state_id' => $state->id]);

    $response = $this->post('/admin/vendors', validVendorPayload([
        'state_id' => $state->id,
        'district_id' => $district->id,
    ]));

    $response->assertRedirect('/admin/vendors');

    $vendor = Vendor::query()->where('company_name', 'Acme Traders Pvt Ltd')->firstOrFail();

    expect($vendor->state_id)->toBe($state->id)
        ->and($vendor->district_id)->toBe($district->id)
        ->and($vendor->pan_no)->toBe('ABCDE1234F')
        ->and($vendor->ifsc_code)->toBe('SBIN0001234')
        ->and($vendor->username)->toBe('acme_traders')
        ->and($vendor->unique_id)->not->toBeNull();

    expect(Hash::check('password123', $vendor->password))->toBeTrue();

    Storage::disk('public')->assertExists($vendor->pan_proof_path);
    Storage::disk('public')->assertExists($vendor->bank_proof_path);
});

test('a vendor is rejected with an invalid pan number', function () {
    $response = $this->post('/admin/vendors', validVendorPayload([
        'pan_no' => 'INVALID',
    ]));

    $response->assertSessionHasErrors('pan_no');
});

test('a vendor is rejected with an invalid ifsc code', function () {
    $response = $this->post('/admin/vendors', validVendorPayload([
        'ifsc_code' => 'BADCODE',
    ]));

    $response->assertSessionHasErrors('ifsc_code');
});

test('a vendor is rejected without a pan proof file', function () {
    $payload = validVendorPayload();
    unset($payload['pan_proof']);

    $response = $this->post('/admin/vendors', $payload);

    $response->assertSessionHasErrors('pan_proof');
});

test('a vendor is rejected if the district does not belong to the given state', function () {
    $state = State::factory()->create();
    $otherState = State::factory()->create();
    $district = District::factory()->create(['state_id' => $otherState->id]);

    $response = $this->post('/admin/vendors', validVendorPayload([
        'state_id' => $state->id,
        'district_id' => $district->id,
    ]));

    $response->assertSessionHasErrors('district_id');
});

test('a vendor is soft deleted', function () {
    $vendor = Vendor::factory()->create();

    $this->delete("/admin/vendors/{$vendor->unique_id}");

    expect($vendor->refresh()->is_delete)->toBeTrue();
    $this->assertDatabaseHas('vendors', ['id' => $vendor->id]);
});

test('the vendor show page renders its details', function () {
    $state = State::factory()->create(['name' => 'Tamil Nadu']);
    $district = District::factory()->create(['state_id' => $state->id, 'name' => 'Chennai']);
    $vendor = Vendor::factory()->create([
        'company_name' => 'Acme Traders Pvt Ltd',
        'state_id' => $state->id,
        'district_id' => $district->id,
    ]);

    $response = $this->get("/admin/vendors/{$vendor->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('vendor.company_name', 'Acme Traders Pvt Ltd')
        ->where('vendor.state', 'Tamil Nadu')
        ->where('vendor.district', 'Chennai')
        ->has('vendor.pan_proof_url')
        ->has('vendor.bank_proof_url')
    );
});

test('a vendor can be updated without re-uploading proof files or a password', function () {
    $vendor = Vendor::factory()->create();
    $originalPanProofPath = $vendor->pan_proof_path;
    $originalPassword = $vendor->password;

    $response = $this->put("/admin/vendors/{$vendor->unique_id}", [
        'company_name' => 'Renamed Traders',
        'name' => $vendor->name,
        'contact_no' => $vendor->contact_no,
        'gst_no' => $vendor->gst_no,
        'pan_no' => $vendor->pan_no,
        'pincode' => $vendor->pincode,
        'state_id' => $vendor->state_id,
        'district_id' => $vendor->district_id,
        'bank_name' => $vendor->bank_name,
        'account_no' => $vendor->account_no,
        'ifsc_code' => $vendor->ifsc_code,
        'account_holder_name' => $vendor->account_holder_name,
        'address' => $vendor->address,
        'username' => $vendor->username,
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors();

    $vendor->refresh();
    expect($vendor->company_name)->toBe('Renamed Traders')
        ->and($vendor->pan_proof_path)->toBe($originalPanProofPath)
        ->and($vendor->password)->toBe($originalPassword);
});
