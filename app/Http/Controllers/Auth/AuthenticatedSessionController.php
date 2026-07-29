<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response
    {
        $props = [
            'hcaptchaSiteKey' => config('services.hcaptcha.site_key'),
            'logoUrl' => asset('images/indian-railways-logo.svg'),
            'trainBackgroundUrl' => asset('images/login-bg.jpg'),
        ];

        // If hCaptcha is not configured, provide our local image captcha URL
        if (! filled(config('services.hcaptcha.site_key')) || ! filled(config('services.hcaptcha.secret_key'))) {
            $props['captchaImageUrl'] = route('captcha');
        }

        return Inertia::render('login', $props);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
