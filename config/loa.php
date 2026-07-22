<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Financial Security Document Requirement
    |--------------------------------------------------------------------------
    |
    | Whether a proof document (BG/EMD certificate) must be attached to each
    | of the LOA's EMD / Performance BG / Security BG records before the
    | "Financial Security" tab can be saved.
    |
    */
    'financial_security_document_required' => env('LOA_FINANCIAL_SECURITY_DOCUMENT_REQUIRED', true),

];
