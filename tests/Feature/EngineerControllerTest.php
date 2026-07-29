<?php

use App\Models\City;
use App\Models\Engineer;
use App\Models\EngineerType;
use App\Models\State;
use App\Models\User;
use App\Support\MaskedIdentifier;
use Illuminate\Testing\TestResponse;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

/**
 * The masked route identifier is re-encrypted (with a fresh random IV) on
 * every access, so two encodings of the same engineer are never byte-equal.
 * Assert on the path shape and decode the identifier back to compare it
 * against the actual record instead of comparing raw redirect strings.
 */
function assertRedirectsToEngineerEditTab(TestResponse $response, Engineer $engineer, string $tab): void
{
    $location = (string) $response->headers->get('Location');

    preg_match('#/admin/engineers/([^/]+)/edit\?tab=(\w+)#', $location, $matches);

    expect($matches[2] ?? null)->toBe($tab)
        ->and(MaskedIdentifier::decode($matches[1] ?? ''))->toBe($engineer->getRawOriginal('unique_id'));
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validEngineerPayload(array $overrides = []): array
{
    $state = State::factory()->create();
    $city = City::factory()->create(['state_id' => $state->id]);
    $engineerType = EngineerType::factory()->create();

    return array_merge([
        'full_name' => 'Rajesh Kumar',
        'gender' => 'Male',
        'date_of_birth' => '1990-05-15',
        'blood_group' => 'O+',
        'nationality' => 'Indian',
        'marital_status' => 'Married',
        'mobile_number' => '9876543210',
        'alternate_mobile_number' => '9876500000',
        'official_email' => 'rajesh.kumar@railerp.in',
        'personal_email' => 'rajesh@example.com',
        'current_address' => '12 Main Street, Chennai',
        'permanent_address' => '12 Main Street, Chennai',
        'state_id' => $state->id,
        'city_id' => $city->id,
        'postal_code' => '600001',
        'aadhaar_number' => '123456789012',
        'pan_number' => 'ABCDE1234F',
        'date_of_joining' => '2020-01-10',
        'employee_status' => 'Active',
        'engineer_type_id' => $engineerType->id,
        'bank_name' => 'State Bank of India',
        'branch_name' => 'Anna Salai',
        'account_number' => '123456789012',
        'account_number_confirmation' => '123456789012',
        'ifsc_code' => 'SBIN0001234',
        'pf_account_number' => 'PF1234567890',
        'esi_account_number' => 'ESI1234567890',
        'languages_known' => ['English', 'Tamil'],
    ], $overrides);
}

test('an engineer can be created with an auto-generated employee code', function () {
    $response = $this->post('/admin/engineers', validEngineerPayload());

    $response->assertRedirect('/admin/engineers');

    $engineer = Engineer::query()->where('official_email', 'rajesh.kumar@railerp.in')->firstOrFail();

    expect($engineer->employee_code)->toStartWith('ENG-')
        ->and($engineer->unique_id)->not->toBeNull()
        ->and($engineer->languages_known)->toBe(['English', 'Tamil']);
});

test('a duplicate aadhaar number is rejected', function () {
    Engineer::factory()->create(['aadhaar_number' => '123456789012']);

    $response = $this->post('/admin/engineers', validEngineerPayload([
        'official_email' => 'another@railerp.in',
        'mobile_number' => '9876543211',
        'aadhaar_number' => '123456789012',
    ]));

    $response->assertSessionHasErrors('aadhaar_number');
});

test('a duplicate pan number is rejected', function () {
    Engineer::factory()->create(['pan_number' => 'ABCDE1234F']);

    $response = $this->post('/admin/engineers', validEngineerPayload([
        'official_email' => 'another@railerp.in',
        'mobile_number' => '9876543211',
        'aadhaar_number' => '987654321098',
        'pan_number' => 'ABCDE1234F',
    ]));

    $response->assertSessionHasErrors('pan_number');
});

test('a duplicate official email is rejected', function () {
    Engineer::factory()->create(['official_email' => 'rajesh.kumar@railerp.in']);

    $response = $this->post('/admin/engineers', validEngineerPayload([
        'mobile_number' => '9876543211',
        'aadhaar_number' => '987654321098',
        'pan_number' => 'BCDEF1234G',
    ]));

    $response->assertSessionHasErrors('official_email');
});

test('a duplicate mobile number is rejected', function () {
    Engineer::factory()->create(['mobile_number' => '9876543210']);

    $response = $this->post('/admin/engineers', validEngineerPayload([
        'official_email' => 'another@railerp.in',
        'aadhaar_number' => '987654321098',
        'pan_number' => 'BCDEF1234G',
    ]));

    $response->assertSessionHasErrors('mobile_number');
});

test('an engineer is rejected with a malformed pan number', function () {
    $response = $this->post('/admin/engineers', validEngineerPayload([
        'pan_number' => 'INVALID123',
    ]));

    $response->assertSessionHasErrors('pan_number');
});

test('an engineer is rejected with a malformed aadhaar number', function () {
    $response = $this->post('/admin/engineers', validEngineerPayload([
        'aadhaar_number' => '12345',
    ]));

    $response->assertSessionHasErrors('aadhaar_number');
});

test('an engineer is rejected with a malformed ifsc code', function () {
    $response = $this->post('/admin/engineers', validEngineerPayload([
        'ifsc_code' => 'NOTVALID',
    ]));

    $response->assertSessionHasErrors('ifsc_code');
});

test('an engineer is rejected with a mismatched account number confirmation', function () {
    $response = $this->post('/admin/engineers', validEngineerPayload([
        'account_number_confirmation' => 'different-account-number',
    ]));

    $response->assertSessionHasErrors('account_number');
});

test('an engineer is rejected if the city does not belong to the given state', function () {
    $state = State::factory()->create();
    $otherState = State::factory()->create();
    $city = City::factory()->create(['state_id' => $otherState->id]);

    $response = $this->post('/admin/engineers', validEngineerPayload([
        'state_id' => $state->id,
        'city_id' => $city->id,
    ]));

    $response->assertSessionHasErrors('city_id');
});

test('an engineer is soft deleted', function () {
    $engineer = Engineer::factory()->create();

    $this->delete("/admin/engineers/{$engineer->unique_id}");

    expect($engineer->refresh()->is_delete)->toBeTrue();
    $this->assertDatabaseHas('engineers', ['id' => $engineer->id]);
});

test('the search endpoint matches by employee code or full name and excludes deleted engineers', function () {
    $engineerType = EngineerType::factory()->create(['name' => 'Site Engineer']);
    $match = Engineer::factory()->create([
        'full_name' => 'Priya Sharma',
        'employee_code' => 'ENG-00042',
        'engineer_type_id' => $engineerType->id,
    ]);
    Engineer::factory()->create(['full_name' => 'Someone Else', 'employee_code' => 'ENG-00099']);
    Engineer::factory()->create(['full_name' => 'Priya Deleted', 'is_delete' => true]);

    $byName = $this->getJson('/admin/engineers/search?search=Priya');

    $byName->assertOk()
        ->assertJsonCount(1, 'engineers')
        ->assertJsonPath('engineers.0.id', $match->id)
        ->assertJsonPath('engineers.0.employee_code', 'ENG-00042')
        ->assertJsonPath('engineers.0.full_name', 'Priya Sharma')
        ->assertJsonPath('engineers.0.engineer_type', 'Site Engineer');

    $byCode = $this->getJson('/admin/engineers/search?search=00042');

    $byCode->assertOk()
        ->assertJsonCount(1, 'engineers')
        ->assertJsonPath('engineers.0.id', $match->id);
});

test('the engineer show page renders its details', function () {
    $state = State::factory()->create(['name' => 'Tamil Nadu']);
    $city = City::factory()->create(['state_id' => $state->id, 'name' => 'Chennai']);
    $engineerType = EngineerType::factory()->create(['name' => 'Site Engineer']);
    $engineer = Engineer::factory()->create([
        'full_name' => 'Priya Sharma',
        'state_id' => $state->id,
        'city_id' => $city->id,
        'engineer_type_id' => $engineerType->id,
    ]);

    $response = $this->get("/admin/engineers/{$engineer->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('engineer.full_name', 'Priya Sharma')
        ->where('engineer.state', 'Tamil Nadu')
        ->where('engineer.city', 'Chennai')
        ->where('engineer.engineer_type', 'Site Engineer')
    );
});

test('an engineer can be updated without a false validation conflict', function () {
    $engineer = Engineer::factory()->create();

    $response = $this->put("/admin/engineers/{$engineer->unique_id}", validEngineerPayload([
        'full_name' => 'Renamed Engineer',
        'official_email' => $engineer->official_email,
        'mobile_number' => $engineer->mobile_number,
        'aadhaar_number' => $engineer->aadhaar_number,
        'pan_number' => $engineer->pan_number,
        'state_id' => $engineer->state_id,
        'city_id' => null,
        'account_number' => $engineer->account_number,
        'account_number_confirmation' => $engineer->account_number,
    ]));

    $response->assertSessionDoesntHaveErrors();
    expect($engineer->refresh()->full_name)->toBe('Renamed Engineer');
});

test('the personal tab can be saved on its own via Save & Continue', function () {
    $response = $this->post('/admin/engineers', [
        'full_name' => 'Rajesh Kumar',
        'gender' => 'Male',
        'date_of_birth' => '1990-05-15',
        'current_step' => 'personal',
        'finish' => '0',
    ]);

    $engineer = Engineer::query()->where('full_name', 'Rajesh Kumar')->firstOrFail();

    assertRedirectsToEngineerEditTab($response, $engineer, 'contact');
    $response->assertSessionDoesntHaveErrors();

    expect($engineer->employee_code)->toStartWith('ENG-')
        ->and($engineer->official_email)->toBeNull()
        ->and($engineer->aadhaar_number)->toBeNull();
});

test('the current tabs own required field is still enforced during Save & Continue', function () {
    $response = $this->post('/admin/engineers', [
        'gender' => 'Male',
        'date_of_birth' => '1990-05-15',
        'current_step' => 'personal',
        'finish' => '0',
    ]);

    $response->assertSessionHasErrors('full_name');
    $this->assertDatabaseCount('engineers', 0);
});

test('an engineer can be completed by saving progress tab by tab then finishing', function () {
    $step1 = $this->post('/admin/engineers', [
        'full_name' => 'Rajesh Kumar',
        'gender' => 'Male',
        'date_of_birth' => '1990-05-15',
        'current_step' => 'personal',
        'finish' => '0',
    ]);

    $engineer = Engineer::query()->where('full_name', 'Rajesh Kumar')->firstOrFail();
    assertRedirectsToEngineerEditTab($step1, $engineer, 'contact');

    $state = State::factory()->create();
    $city = City::factory()->create(['state_id' => $state->id]);

    $step2 = $this->put("/admin/engineers/{$engineer->unique_id}", [
        'full_name' => $engineer->full_name,
        'gender' => $engineer->gender,
        'date_of_birth' => $engineer->date_of_birth->format('Y-m-d'),
        'mobile_number' => '9876543210',
        'official_email' => 'rajesh.kumar@railerp.in',
        'current_address' => '12 Main Street, Chennai',
        'permanent_address' => '12 Main Street, Chennai',
        'postal_code' => '600001',
        'state_id' => $state->id,
        'city_id' => $city->id,
        'current_step' => 'contact',
        'finish' => '0',
    ]);

    assertRedirectsToEngineerEditTab($step2, $engineer, 'identity');
    $step2->assertSessionDoesntHaveErrors();
    expect($engineer->refresh()->official_email)->toBe('rajesh.kumar@railerp.in');

    $engineerType = EngineerType::factory()->create();

    $finish = $this->put("/admin/engineers/{$engineer->unique_id}", validEngineerPayload([
        'full_name' => $engineer->full_name,
        'official_email' => $engineer->official_email,
        'mobile_number' => $engineer->mobile_number,
        'state_id' => $state->id,
        'city_id' => $city->id,
        'engineer_type_id' => $engineerType->id,
        'finish' => '1',
    ]));

    $finish->assertRedirect('/admin/engineers');
    $finish->assertSessionDoesntHaveErrors();
    expect($engineer->refresh()->aadhaar_number)->not->toBeNull();
});
