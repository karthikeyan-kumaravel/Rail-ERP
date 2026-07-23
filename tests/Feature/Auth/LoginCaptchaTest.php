<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;

describe('login captcha handling', function () {
    it('allows login when the captcha challenge is solved', function () {
        config()->set('services.hcaptcha.site_key', null);
        config()->set('services.hcaptcha.secret_key', null);

        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => 'secret123',
        ]);

        $this->get('/captcha');
        $answer = session('login_captcha.answer');

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'secret123',
            'captcha_answer' => $answer,
        ]);

        $response->assertRedirect();
        $this->assertAuthenticatedAs($user);
    });

    it('allows login with a username using the form field from the login page', function () {
        config()->set('services.hcaptcha.site_key', null);
        config()->set('services.hcaptcha.secret_key', null);

        $user = User::factory()->create([
            'username' => 'Admin',
            'email' => 'admin@example.com',
            'password' => 'secret123',
        ]);

        $this->get('/captcha');
        $answer = session('login_captcha.answer');

        $response = $this->post('/login', [
            'email' => $user->username,
            'password' => 'secret123',
            'captcha_answer' => $answer,
        ]);

        $response->assertRedirect();
        $this->assertAuthenticatedAs($user);
    });

    it('keeps the user signed in when remember me is selected', function () {
        config()->set('services.hcaptcha.site_key', null);
        config()->set('services.hcaptcha.secret_key', null);

        $user = User::factory()->create([
            'email' => 'remembered@example.com',
            'password' => 'secret123',
        ]);

        $this->get('/captcha');
        $answer = session('login_captcha.answer');

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'secret123',
            'remember' => true,
            'captcha_answer' => $answer,
        ]);

        $response->assertRedirect();
        $response->assertCookie(Auth::guard()->getRecallerName());
        $this->assertAuthenticatedAs($user);
    });

    it('blocks login when the captcha challenge is not completed', function () {
        config()->set('services.hcaptcha.site_key', null);
        config()->set('services.hcaptcha.secret_key', null);

        $user = User::factory()->create([
            'email' => 'blocked@example.com',
            'password' => 'secret123',
        ]);

        $this->get('/captcha');

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'secret123',
            'captcha_answer' => '',
        ]);

        $response->assertSessionHasErrors('captcha_answer');
        $this->assertGuest();
    });
});
