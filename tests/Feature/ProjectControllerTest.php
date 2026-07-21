<?php

use App\Models\Customer;
use App\Models\Division;
use App\Models\Loa;
use App\Models\Project;
use App\Models\User;
use App\Models\Zone;
use App\Support\MaskedIdentifier;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

function validProjectPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Chennai CCTV Upgrade',
        'customer_id' => Customer::factory()->create()->id,
        'zone_id' => Zone::factory()->create()->id,
        'division_id' => Division::factory()->create()->id,
        'loa_id' => Loa::factory()->create()->id,
        'contract_value' => 2500000,
        'active_status' => '1',
    ], $overrides);
}

test('a project can be created', function () {
    $customer = Customer::factory()->create();
    $zone = Zone::factory()->create();
    $division = Division::factory()->create();
    $loa = Loa::factory()->create();

    $response = $this->post('/admin/projects', validProjectPayload([
        'customer_id' => $customer->id,
        'zone_id' => $zone->id,
        'division_id' => $division->id,
        'loa_id' => $loa->id,
    ]));

    $response->assertRedirect('/admin/projects');

    $project = Project::query()->where('name', 'Chennai CCTV Upgrade')->firstOrFail();

    expect($project->customer_id)->toBe($customer->id)
        ->and($project->zone_id)->toBe($zone->id)
        ->and($project->division_id)->toBe($division->id)
        ->and($project->loa_id)->toBe($loa->id)
        ->and((float) $project->contract_value)->toBe(2500000.0)
        ->and($project->unique_id)->not->toBeNull();
});

test('a duplicate project name is rejected', function () {
    Project::factory()->create(['name' => 'Chennai CCTV Upgrade']);

    $response = $this->post('/admin/projects', validProjectPayload());

    $response->assertSessionHasErrors('name');
});

test('a negative contract value is rejected', function () {
    $response = $this->post('/admin/projects', validProjectPayload([
        'contract_value' => -100,
    ]));

    $response->assertSessionHasErrors('contract_value');
});

test('a project is soft deleted', function () {
    $project = Project::factory()->create();

    $this->delete("/admin/projects/{$project->unique_id}");

    expect($project->refresh()->is_delete)->toBeTrue();
});

test('a project keeps its own name when updated', function () {
    $project = Project::factory()->create(['name' => 'Madurai Signal Renewal']);

    $response = $this->put("/admin/projects/{$project->unique_id}", validProjectPayload([
        'name' => 'Madurai Signal Renewal',
        'customer_id' => $project->customer_id,
        'zone_id' => $project->zone_id,
        'division_id' => $project->division_id,
        'loa_id' => $project->loa_id,
    ]));

    $response->assertSessionDoesntHaveErrors('name');
    expect($project->refresh()->name)->toBe('Madurai Signal Renewal');
});

test('a project dashboard can be viewed', function () {
    $project = Project::factory()->create();

    $response = $this->get("/admin/projects/{$project->unique_id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/projects/dashboard')
        ->where('project.name', $project->name)
        ->has('project.unique_id')
        ->has('metrics')
        ->has('boq_items')
        ->has('recent_bills')
        ->has('station_summary')
        ->has('payment_summary'));

    $decodedId = MaskedIdentifier::decode(
        $response->viewData('page')['props']['project']['unique_id'],
    );

    expect($decodedId)->toBe($project->getRawOriginal('unique_id'));
});
