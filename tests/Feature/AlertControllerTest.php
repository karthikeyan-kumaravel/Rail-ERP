<?php

use App\Models\Alert;
use App\Models\Loa;
use App\Models\User;
use App\Support\MaskedIdentifier;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
    Carbon::setTestNow('2026-07-22 09:00:00');
});

afterEach(function () {
    Carbon::setTestNow();
});

test('the alerts index page lists active alerts', function () {
    $loa = Loa::factory()->create();
    Alert::factory()->create([
        'alertable_id' => $loa->id,
        'title' => 'Upcoming Completion: RAILWAY/ABC/2026/001',
        'severity' => Alert::SEVERITY_WARNING,
        'due_date' => '2026-08-01',
    ]);

    $response = $this->get('/admin/alerts');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/alerts/index')
        ->where('activeCount', 1)
        ->has('alerts.data', 1)
        ->where('alerts.data.0.title', 'Upcoming Completion: RAILWAY/ABC/2026/001')
        ->where('alerts.data.0.link_label', 'LOA')
    );
});

test('soft deleted alerts are excluded from the index', function () {
    $loa = Loa::factory()->create();
    Alert::factory()->create([
        'alertable_id' => $loa->id,
        'is_delete' => true,
    ]);

    $response = $this->get('/admin/alerts');

    $response->assertInertia(fn (Assert $page) => $page
        ->where('activeCount', 0)
        ->has('alerts.data', 0)
    );
});

test('the alerts index page filters by severity', function () {
    $criticalLoa = Loa::factory()->create();
    $warningLoa = Loa::factory()->create();

    Alert::factory()->create(['alertable_id' => $criticalLoa->id, 'severity' => Alert::SEVERITY_CRITICAL]);
    Alert::factory()->create(['alertable_id' => $warningLoa->id, 'severity' => Alert::SEVERITY_WARNING]);

    $response = $this->get('/admin/alerts?severity=critical');

    $response->assertInertia(fn (Assert $page) => $page
        ->has('alerts.data', 1)
        ->where('alerts.data.0.severity', 'critical')
    );
});

test('the alerts index page links to the underlying loa', function () {
    $loa = Loa::factory()->create();
    Alert::factory()->create(['alertable_id' => $loa->id]);

    $response = $this->get('/admin/alerts');

    $response->assertInertia(function (Assert $page) use ($loa) {
        $page->where('alerts.data.0.link_url', function (string $url) use ($loa) {
            preg_match('#/admin/loas/([^/]+)$#', $url, $matches);

            return MaskedIdentifier::decode($matches[1] ?? '') === $loa->getRawOriginal('unique_id');
        });
    });
});
