<?php

use App\Models\Bank;
use App\Models\Loa;
use App\Models\LoaFinancialSecurity;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('a bank can be created', function () {
    $response = $this->post('/admin/banks', [
        'name' => 'State Bank of India',
        'active_status' => '1',
    ]);

    $response->assertRedirect('/admin/banks');

    $bank = Bank::query()->where('name', 'State Bank of India')->firstOrFail();

    expect($bank->active_status)->toBeTrue()
        ->and($bank->unique_id)->not->toBeNull();
});

test('a duplicate bank name is rejected', function () {
    Bank::factory()->create(['name' => 'Indian Overseas Bank']);

    $response = $this->post('/admin/banks', [
        'name' => 'Indian Overseas Bank',
        'active_status' => '1',
    ]);

    $response->assertSessionHasErrors('name');
});

test('a bank is soft deleted', function () {
    $bank = Bank::factory()->create();

    $this->delete("/admin/banks/{$bank->unique_id}");

    expect($bank->refresh()->is_delete)->toBeTrue();
});

test('a bank keeps its own name when updated', function () {
    $bank = Bank::factory()->create(['name' => 'Axis Bank']);

    $response = $this->put("/admin/banks/{$bank->unique_id}", [
        'name' => 'Axis Bank',
        'active_status' => '1',
    ]);

    $response->assertSessionDoesntHaveErrors('name');
    expect($bank->refresh()->name)->toBe('Axis Bank');
});

test('a bank assigned to an loa financial security record cannot be deleted', function () {
    $bank = Bank::factory()->create();
    $loa = Loa::factory()->create();
    LoaFinancialSecurity::factory()->create(['loa_id' => $loa->id, 'bank_id' => $bank->id]);

    $this->delete("/admin/banks/{$bank->unique_id}");

    expect($bank->refresh()->is_delete)->toBeFalse();
});
