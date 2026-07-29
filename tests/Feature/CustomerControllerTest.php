<?php

use App\Models\Customer;
use App\Models\District;
use App\Models\State;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a customer can be created with a district that belongs to the given state', function () {
    $state = State::factory()->create();
    $district = District::factory()->create(['state_id' => $state->id]);

    $response = $this->post('/admin/customers', [
        'name' => 'Acme Traders',
        'billing_address' => '12 Main Street',
        'pin_code' => '688001',
        'state_id' => $state->id,
        'district_id' => $district->id,
        'zone' => 'Alappuzha',
        'contact_name' => 'John Doe',
        'contact_number' => '9876543210',
        'contact_landline_number' => '0471123456',
        'email' => 'john@example.com',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/customers');

    $customer = Customer::query()->where('name', 'Acme Traders')->firstOrFail();

    expect($customer->state_id)->toBe($state->id)
        ->and($customer->district_id)->toBe($district->id)
        ->and($customer->contact_name)->toBe('John Doe')
        ->and($customer->unique_id)->not->toBeNull();
});

test('a customer is rejected if the district does not belong to the given state', function () {
    $state = State::factory()->create();
    $otherState = State::factory()->create();
    $district = District::factory()->create(['state_id' => $otherState->id]);

    $response = $this->post('/admin/customers', [
        'name' => 'Acme Traders',
        'billing_address' => '12 Main Street',
        'pin_code' => '688001',
        'state_id' => $state->id,
        'district_id' => $district->id,
        'zone' => 'Alappuzha',
        'contact_name' => 'John Doe',
        'contact_number' => '9876543210',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('district_id');
});

test('a customer is rejected with an invalid pin code', function () {
    $state = State::factory()->create();
    $district = District::factory()->create(['state_id' => $state->id]);

    $response = $this->post('/admin/customers', [
        'name' => 'Acme Traders',
        'billing_address' => '12 Main Street',
        'pin_code' => '12345',
        'state_id' => $state->id,
        'district_id' => $district->id,
        'zone' => 'Alappuzha',
        'contact_name' => 'John Doe',
        'contact_number' => '9876543210',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('pin_code');
});

test('a customer is rejected with an invalid email', function () {
    $state = State::factory()->create();
    $district = District::factory()->create(['state_id' => $state->id]);

    $response = $this->post('/admin/customers', [
        'name' => 'Acme Traders',
        'billing_address' => '12 Main Street',
        'pin_code' => '688001',
        'state_id' => $state->id,
        'district_id' => $district->id,
        'zone' => 'Alappuzha',
        'contact_name' => 'John Doe',
        'contact_number' => '9876543210',
        'email' => 'not-an-email',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('email');
});

test('a customer is soft deleted', function () {
    $customer = Customer::factory()->create();

    $this->delete("/admin/customers/{$customer->unique_id}");

    expect($customer->refresh()->is_delete)->toBeTrue();
    $this->assertDatabaseHas('customers', ['id' => $customer->id]);
});

test('the customer show page renders its details', function () {
    $state = State::factory()->create(['name' => 'Kerala']);
    $district = District::factory()->create(['state_id' => $state->id, 'name' => 'Alappuzha']);
    $customer = Customer::factory()->create([
        'name' => 'Acme Traders',
        'state_id' => $state->id,
        'district_id' => $district->id,
        'contact_name' => 'John Doe',
    ]);

    $response = $this->get("/admin/customers/{$customer->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('customer.name', 'Acme Traders')
        ->where('customer.state', 'Kerala')
        ->where('customer.district', 'Alappuzha')
        ->where('customer.contact_name', 'John Doe')
    );
});

test('a customer can be updated without a false validation conflict', function () {
    $customer = Customer::factory()->create();

    $response = $this->put("/admin/customers/{$customer->unique_id}", [
        'name' => 'Renamed Traders',
        'billing_address' => $customer->billing_address,
        'pin_code' => $customer->pin_code,
        'state_id' => $customer->state_id,
        'district_id' => $customer->district_id,
        'zone' => $customer->zone,
        'contact_name' => $customer->contact_name,
        'contact_number' => $customer->contact_number,
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors();
    expect($customer->refresh()->name)->toBe('Renamed Traders');
});
