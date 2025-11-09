<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

beforeEach(function () {
    // Mock Socialite para tests
    $this->mockSocialiteUser = \Mockery::mock(SocialiteUser::class);
});

test('redirige a Google para autenticación', function () {
    $response = $this->get(route('google.redirect'));

    $response->assertRedirect();
});

test('usuario autorizado puede hacer login con Google', function () {
    // Crear usuario autorizado
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'authorized' => true,
    ]);

    // Mock del usuario de Google
    $this->mockSocialiteUser
        ->shouldReceive('getId')
        ->andReturn('google-id-123')
        ->shouldReceive('getEmail')
        ->andReturn('test@example.com')
        ->shouldReceive('getName')
        ->andReturn('Test User')
        ->shouldReceive('getAvatar')
        ->andReturn('https://example.com/avatar.jpg');

    Socialite::shouldReceive('driver->user')
        ->andReturn($this->mockSocialiteUser);

    $response = $this->get(route('google.callback'));

    $response->assertRedirect(route('dashboard', absolute: false));

    // Verificar que el usuario fue autenticado
    expect(Auth::check())->toBeTrue();
    expect(Auth::user()->email)->toBe('test@example.com');

    // Verificar que se actualizó la información de Google
    $user->refresh();
    expect($user->google_id)->toBe('google-id-123');
    expect($user->avatar)->toBe('https://example.com/avatar.jpg');
});

test('usuario no existente no puede hacer login', function () {
    // Mock del usuario de Google que no existe en BD
    $this->mockSocialiteUser
        ->shouldReceive('getEmail')
        ->andReturn('noexiste@example.com');

    Socialite::shouldReceive('driver->user')
        ->andReturn($this->mockSocialiteUser);

    $response = $this->get(route('google.callback'));

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error');
    expect(Auth::check())->toBeFalse();
});

test('usuario no autorizado no puede hacer login', function () {
    // Crear usuario NO autorizado
    User::factory()->create([
        'email' => 'notauthorized@example.com',
        'authorized' => false,
    ]);

    // Mock del usuario de Google
    $this->mockSocialiteUser
        ->shouldReceive('getEmail')
        ->andReturn('notauthorized@example.com');

    Socialite::shouldReceive('driver->user')
        ->andReturn($this->mockSocialiteUser);

    $response = $this->get(route('google.callback'));

    $response->assertRedirect(route('login'));
    $response->assertSessionHas('error');
    expect(Auth::check())->toBeFalse();
});

test('comando user:authorize puede autorizar usuarios nuevos', function () {
    $this->artisan('user:authorize', ['email' => 'newuser@example.com'])
        ->expectsQuestion('Nombre del usuario', 'New User')
        ->expectsOutput('✓ Usuario newuser@example.com creado y autorizado exitosamente.')
        ->assertExitCode(0);

    $user = User::where('email', 'newuser@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->authorized)->toBeTrue();
    expect($user->password)->toBeNull();
});

test('comando user:authorize puede autorizar usuarios existentes', function () {
    User::factory()->create([
        'email' => 'existing@example.com',
        'authorized' => false,
    ]);

    $this->artisan('user:authorize', ['email' => 'existing@example.com'])
        ->expectsOutput('✓ Usuario existing@example.com autorizado exitosamente.')
        ->assertExitCode(0);

    $user = User::where('email', 'existing@example.com')->first();
    expect($user->authorized)->toBeTrue();
});

test('comando user:authorize puede revocar autorización', function () {
    User::factory()->create([
        'email' => 'revoke@example.com',
        'authorized' => true,
    ]);

    $this->artisan('user:authorize', [
        'email' => 'revoke@example.com',
        '--revoke' => true,
    ])
        ->expectsOutput('✓ Autorización revocada para revoke@example.com.')
        ->assertExitCode(0);

    $user = User::where('email', 'revoke@example.com')->first();
    expect($user->authorized)->toBeFalse();
});
