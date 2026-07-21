<?php

use App\Models\Activity;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('per_page accepts the new 250 and 500 page sizes', function (int $perPage) {
    Activity::factory()->count(3)->create();

    $response = $this->get("/admin/activities?per_page={$perPage}");

    $response->assertInertia(fn (Assert $page) => $page
        ->where('filters.per_page', $perPage)
        ->where('activities.per_page', $perPage)
    );
})->with([250, 500]);

test('an invalid per_page value falls back to the default of 10', function () {
    $response = $this->get('/admin/activities?per_page=999');

    $response->assertInertia(fn (Assert $page) => $page
        ->where('filters.per_page', 10)
        ->where('activities.per_page', 10)
    );
});

test('per_page=All returns every matching record on a single page', function () {
    Activity::factory()->count(120)->create();

    $response = $this->get('/admin/activities?per_page=All');

    $response->assertInertia(fn (Assert $page) => $page
        ->where('filters.per_page', 'All')
        ->where('activities.current_page', 1)
        ->where('activities.last_page', 1)
        ->where('activities.total', 120)
        ->has('activities.data', 120)
    );
});

test('per_page=All still respects the active search filter', function () {
    Activity::factory()->create(['name' => 'Survey Work']);
    Activity::factory()->create(['name' => 'Drawing Review']);
    Activity::factory()->count(10)->create(['name' => 'Unrelated Task']);

    $response = $this->get('/admin/activities?per_page=All&search=Survey');

    $response->assertInertia(fn (Assert $page) => $page
        ->where('filters.per_page', 'All')
        ->where('activities.total', 1)
        ->has('activities.data', 1)
        ->where('activities.data.0.name', 'Survey Work')
    );
});

test('per_page=All on an empty result set does not error', function () {
    $response = $this->get('/admin/activities?per_page=All&search=NoSuchActivityExists');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->where('activities.total', 0)
        ->where('activities.last_page', 1)
        ->has('activities.data', 0)
    );
});

test('per_page=All fetches all matching rows in a single select plus a single count query', function () {
    Activity::factory()->count(50)->create();

    DB::enableQueryLog();
    $this->get('/admin/activities?per_page=All')->assertOk();
    $queries = collect(DB::getQueryLog())
        ->pluck('query')
        ->filter(fn (string $query) => str_contains($query, '"activities"'));
    DB::disableQueryLog();

    $selects = $queries->filter(fn (string $query) => str_starts_with($query, 'select') && ! str_contains($query, 'count('));
    $counts = $queries->filter(fn (string $query) => str_contains($query, 'count('));

    expect($selects)->toHaveCount(1)
        ->and($counts)->toHaveCount(1);
});

test('the selected per_page is echoed back so it survives navigation', function () {
    $response = $this->get('/admin/activities?per_page=250&sort=name&direction=desc');

    $response->assertInertia(fn (Assert $page) => $page
        ->where('filters.per_page', 250)
        ->where('filters.sort', 'name')
        ->where('filters.direction', 'desc')
    );
});
