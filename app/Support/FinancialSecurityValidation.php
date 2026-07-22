<?php

namespace App\Support;

use App\Models\Loa;
use App\Models\LoaFinancialSecurity;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Cross-checks the EMD/Performance BG/Security BG document requirement,
 * shared between StoreLoaRequest and UpdateLoaRequest. A section already
 * backed by a stored file (on update) is satisfied without a new upload
 * unless that file is being explicitly removed — this can't be expressed as
 * a static validation rule since it depends on what's already on disk.
 */
final class FinancialSecurityValidation
{
    public static function validateDocuments(FormRequest $request, ?Loa $loa, Validator $validator): void
    {
        if (! config('loa.financial_security_document_required', true)) {
            return;
        }

        $existingFilePaths = $loa
            ? LoaFinancialSecurity::query()
                ->where('loa_id', $loa->id)
                ->where('is_delete', false)
                ->pluck('file_path', 'security_type')
            : collect();

        foreach (LoaFinancialSecurity::TYPES as $type) {
            $section = $request->input("financial_securities.{$type}", []);
            $removingFile = (bool) ($section['remove_file'] ?? false);
            $hasNewFile = $request->hasFile("financial_securities.{$type}.file");
            $hasExistingFile = filled($existingFilePaths->get($type));

            if (! $hasNewFile && (! $hasExistingFile || $removingFile)) {
                $validator->errors()->add(
                    "financial_securities.{$type}.file",
                    'A document is required for this security type.',
                );
            }
        }
    }
}
