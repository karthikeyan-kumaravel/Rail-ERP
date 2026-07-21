<?php

use App\Imports\Settings\SettingsImportDefinitionRegistry;
use App\Models\User;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

test('downloading and re-uploading a template only reads the data sheet for every import module', function (string $module) {
    $definition = app(SettingsImportDefinitionRegistry::class)->get($module);

    $templateResponse = $this->get("/admin/imports/{$module}/template");
    $templateResponse->assertOk();

    $path = tempnam(sys_get_temp_dir(), 'settings-template-roundtrip').'.xlsx';
    file_put_contents($path, $templateResponse->streamedContent());
    $file = new UploadedFile($path, "{$module}.xlsx", null, null, true);

    $preview = $this->postJson("/admin/imports/{$module}/preview", ['file' => $file]);

    $preview->assertOk();
    // Every template has exactly as many data rows as sample rows; if the
    // "Instructions" sheet were also read, total_records would be much
    // larger (it repeats the sample rows again as plain instructional text).
    $preview->assertJsonPath('summary.total_records', count($definition->sampleRows));
})->with([
    'states', 'districts', 'cities', 'zones', 'divisions', 'stations',
    'customers', 'vendors', 'activities', 'engineer-types', 'units',
    'departments', 'schedule-names', 'schedule-types', 'projects',
]);
