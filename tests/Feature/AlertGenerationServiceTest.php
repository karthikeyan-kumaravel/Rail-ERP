<?php

use App\Models\Alert;
use App\Models\Division;
use App\Models\Loa;
use App\Models\User;
use App\Services\AlertGenerationService;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    Carbon::setTestNow('2026-07-22 09:00:00');
});

afterEach(function () {
    Carbon::setTestNow();
});

function detailsTabPayload(int $divisionId, array $overrides = []): array
{
    return array_merge([
        'loa_number' => 'RAILWAY/ABC/2026/001',
        'client' => 'Southern Railway',
        'division_id' => $divisionId,
        'work_type' => 'Track Renewal',
        'contract_value_amount' => 50.5,
        'contract_value_unit' => 'Cr',
        'completion_period_months' => 18,
        'defect_liability_months' => 12,
        'start_date' => '2026-01-01',
        'end_date' => '2027-06-30',
        'total_stations' => 10,
        'active_status' => '1',
        'team' => [['name' => '', 'role' => '']],
        'current_step' => 'details',
        'finish' => '0',
    ], $overrides);
}

test('a loa completing within 30 days gets a completion alert', function () {
    $loa = Loa::factory()->create(['completion_date' => '2026-08-10']);

    app(AlertGenerationService::class)->syncLoaCompletionAlerts();

    $alert = Alert::query()->where('alertable_id', $loa->id)->where('alertable_type', Loa::class)->firstOrFail();

    expect($alert->type)->toBe(Alert::TYPE_LOA_COMPLETION_APPROACHING)
        ->and($alert->severity)->toBe(Alert::SEVERITY_WARNING)
        ->and($alert->is_delete)->toBeFalse()
        ->and($alert->due_date->toDateString())->toBe('2026-08-10');
});

test('a loa completing beyond 30 days does not get a completion alert', function () {
    $loa = Loa::factory()->create(['completion_date' => '2026-12-01']);

    app(AlertGenerationService::class)->syncLoaCompletionAlerts();

    expect(Alert::query()->where('alertable_id', $loa->id)->where('alertable_type', Loa::class)->exists())->toBeFalse();
});

test('a loa with a completion date already in the past does not get a completion alert', function () {
    $loa = Loa::factory()->create(['completion_date' => '2026-07-01']);

    app(AlertGenerationService::class)->syncLoaCompletionAlerts();

    expect(Alert::query()->where('alertable_id', $loa->id)->where('alertable_type', Loa::class)->exists())->toBeFalse();
});

test('a completion alert is marked critical when 7 or fewer days remain', function () {
    $loa = Loa::factory()->create(['completion_date' => '2026-07-27']);

    app(AlertGenerationService::class)->syncLoaCompletionAlerts();

    $alert = Alert::query()->where('alertable_id', $loa->id)->where('alertable_type', Loa::class)->firstOrFail();

    expect($alert->severity)->toBe(Alert::SEVERITY_CRITICAL);
});

test('an alert is retired once its loa no longer qualifies for the completion window', function () {
    $loa = Loa::factory()->create(['completion_date' => '2026-08-10']);
    app(AlertGenerationService::class)->syncLoaCompletionAlerts();

    $loa->update(['completion_date' => '2026-12-01']);
    app(AlertGenerationService::class)->syncLoaCompletionAlertForLoa($loa->fresh());

    $alert = Alert::query()->where('alertable_id', $loa->id)->where('alertable_type', Loa::class)->firstOrFail();

    expect($alert->is_delete)->toBeTrue();
});

test('the alerts generate command syncs completion alerts across every loa', function () {
    $qualifying = Loa::factory()->create(['completion_date' => '2026-08-05']);
    $nonQualifying = Loa::factory()->create(['completion_date' => '2027-01-01']);

    $this->artisan('alerts:generate')->assertExitCode(0);

    expect(Alert::query()->where('alertable_id', $qualifying->id)->where('is_delete', false)->exists())->toBeTrue()
        ->and(Alert::query()->where('alertable_id', $nonQualifying->id)->where('is_delete', false)->exists())->toBeFalse();
});

test('creating an loa via the wizard immediately generates its completion alert', function () {
    $division = Division::factory()->create();

    $this->post('/admin/loas', detailsTabPayload($division->id, [
        'completion_date' => '2026-08-01',
    ]));

    $loa = Loa::query()->where('loa_number', 'RAILWAY/ABC/2026/001')->firstOrFail();

    expect(Alert::query()->where('alertable_id', $loa->id)->where('is_delete', false)->exists())->toBeTrue();
});

test('updating an loas completion date immediately refreshes its alert', function () {
    $division = Division::factory()->create();
    $loa = Loa::factory()->create(['division_id' => $division->id, 'completion_date' => '2026-08-01']);
    app(AlertGenerationService::class)->syncLoaCompletionAlertForLoa($loa);

    $this->put("/admin/loas/{$loa->unique_id}", detailsTabPayload($division->id, [
        'loa_number' => $loa->loa_number,
        'completion_date' => '2027-01-01',
    ]));

    $alert = Alert::query()->where('alertable_id', $loa->id)->where('alertable_type', Loa::class)->firstOrFail();

    expect($alert->is_delete)->toBeTrue();
});

test('soft deleting an loa immediately retires its alert', function () {
    $loa = Loa::factory()->create(['completion_date' => '2026-08-01']);
    app(AlertGenerationService::class)->syncLoaCompletionAlertForLoa($loa);

    $this->delete("/admin/loas/{$loa->unique_id}");

    $alert = Alert::query()->where('alertable_id', $loa->id)->where('alertable_type', Loa::class)->firstOrFail();

    expect($alert->is_delete)->toBeTrue();
});
