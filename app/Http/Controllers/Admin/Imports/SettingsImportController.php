<?php

namespace App\Http\Controllers\Admin\Imports;

use App\Exports\Settings\SettingsErrorReportExport;
use App\Exports\Settings\SettingsTemplateExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Imports\SettingsImportCommitRequest;
use App\Http\Requests\Admin\Imports\SettingsImportUploadRequest;
use App\Imports\Settings\SettingsImportDefinitionRegistry;
use App\Models\ImportLog;
use App\Services\Settings\SettingsImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class SettingsImportController extends Controller
{
    public function __construct(
        private readonly SettingsImportDefinitionRegistry $definitions,
        private readonly SettingsImportService $imports,
    ) {}

    public function preview(SettingsImportUploadRequest $request, string $module): JsonResponse
    {
        try {
            $result = $this->imports->preview(
                $module,
                $request->file('file'),
                $request->user()?->id,
            );
        } catch (InvalidArgumentException) {
            abort(404);
        }

        return response()->json($result);
    }

    public function store(SettingsImportCommitRequest $request, string $module): JsonResponse
    {
        try {
            $result = $this->imports->commit(
                $module,
                (string) $request->validated('token'),
                $request->user()?->id,
            );
        } catch (InvalidArgumentException) {
            abort(404);
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $throwable) {
            report($throwable);

            return response()->json([
                'message' => 'Import failed because of a critical error. No records were imported.',
                'error' => $throwable->getMessage(),
            ], 500);
        }

        return response()->json($result);
    }

    public function template(string $module): BinaryFileResponse
    {
        try {
            $definition = $this->definitions->get($module);
        } catch (InvalidArgumentException) {
            abort(404);
        }

        $filename = str_replace(' ', '-', strtolower($definition->label)).'-import-template.xlsx';

        return Excel::download(new SettingsTemplateExport($definition), $filename);
    }

    public function errors(ImportLog $importLog): BinaryFileResponse
    {
        try {
            $definition = $this->definitions->get($importLog->module);
        } catch (InvalidArgumentException) {
            abort(404);
        }

        $filename = str_replace(' ', '-', strtolower($definition->label)).'-import-errors-'.$importLog->id.'.xlsx';

        return Excel::download(new SettingsErrorReportExport($definition, $importLog), $filename);
    }
}
