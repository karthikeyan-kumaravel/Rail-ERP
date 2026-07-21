<?php

use App\Models\User;

test('example', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});

test('a user can log in with their username', function () {
    $user = User::factory()->create(['username' => 'jdoe']);

    $response = $this->postJson('/api/login', [
        'login' => 'jdoe',
        'password' => 'password',
    ]);

    $response->assertOk();
    $this->assertAuthenticatedAs($user);
});

test('a user can log in with their email', function () {
    $user = User::factory()->create(['username' => 'jdoe', 'email' => 'jdoe@example.com']);

    $response = $this->postJson('/api/login', [
        'login' => 'jdoe@example.com',
        'password' => 'password',
    ]);

    $response->assertOk();
    $this->assertAuthenticatedAs($user);
});

test('a user cannot log in with their display name', function () {
    User::factory()->create(['name' => 'John Doe', 'username' => 'jdoe']);

    $response = $this->postJson('/api/login', [
        'login' => 'John Doe',
        'password' => 'password',
    ]);

    $response->assertUnprocessable();
    $this->assertGuest();
});

test('login fails with an invalid password', function () {
    User::factory()->create(['username' => 'jdoe']);

    $response = $this->postJson('/api/login', [
        'login' => 'jdoe',
        'password' => 'wrong-password',
    ]);

    $response->assertUnprocessable();
    $this->assertGuest();
});
