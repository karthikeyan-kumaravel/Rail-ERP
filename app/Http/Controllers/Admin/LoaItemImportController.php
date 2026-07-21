<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportLoaItemsRequest;
use App\Services\LoaItemImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class LoaItemImportController extends Controller
{
    public function __invoke(ImportLoaItemsRequest $request, LoaItemImportService $service): JsonResponse
    {
        $file = $request->file('file');

        if (! $file instanceof UploadedFile) {
            throw ValidationException::withMessages([
                'file' => 'Select an Excel file to import.',
            ]);
        }

        return response()->json($service->preview($file));
    }
}
