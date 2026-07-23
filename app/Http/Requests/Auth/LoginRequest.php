<?php

namespace App\Http\Requests\Auth;

use App\Rules\HCaptcha;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $rules = [
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
            'captcha_answer' => ['required', 'string'],
        ];

        if ($this->captchaEnabled()) {
            $rules['h_captcha_response'] = ['required', new HCaptcha];
        }

        return $rules;
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $credentials = $this->credentials();

        if (! Auth::attempt($credentials, $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($validator->errors()->hasAny(['captcha_answer', 'h_captcha_response'])) {
                return;
            }

            $expected = (string) $this->session()->get('login_captcha.answer');
            $provided = trim((string) $this->input('captcha_answer'));

            if ($expected === '' || $provided !== $expected) {
                $validator->errors()->add('captcha_answer', 'Please check the captcha verification.');
            }
        });
    }

    protected function credentials(): array
    {
        $login = trim((string) $this->string('email'));

        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            return [
                'email' => $login,
                'password' => $this->string('password')->toString(),
            ];
        }

        return [
            'username' => $login,
            'password' => $this->string('password')->toString(),
        ];
    }

    protected function captchaEnabled(): bool
    {
        return filled(config('services.hcaptcha.site_key'))
            && filled(config('services.hcaptcha.secret_key'));
    }

    protected function ensureIsNotRateLimited(): void
    {
        if (RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            event(new Lockout($this));

            $seconds = RateLimiter::availableIn($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => "Too many attempts. Please try again in {$seconds} seconds.",
            ]);
        }
    }

    protected function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
