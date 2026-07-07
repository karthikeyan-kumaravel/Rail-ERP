<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Request;

class HCaptcha implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || $value === '') {
            $fail('Please complete the captcha challenge.');

            return;
        }

        $response = Http::asForm()->post('https://hcaptcha.com/siteverify', [
            'secret' => config('services.hcaptcha.secret_key'),
            'response' => $value,
            'remoteip' => Request::ip(),
        ]);

        if (! $response->json('success', false)) {
            $fail('Captcha verification failed. Please try again.');
        }
    }
}
