<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirige al usuario a Google para autenticación
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Maneja el callback de Google OAuth
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Verificar si el usuario está pre-autorizado
            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {
                // El usuario no existe en la base de datos
                return redirect()->route('login')->with('error', 'Tu correo no está autorizado. Contacta al administrador.');
            }

            if (! $user->authorized) {
                // El usuario existe pero no está autorizado
                return redirect()->route('login')->with('error', 'Tu cuenta no ha sido autorizada aún. Contacta al administrador.');
            }

            // Actualizar información del usuario con datos de Google
            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'name' => $googleUser->getName(),
            ]);

            // Autenticar al usuario
            Auth::login($user, true);

            return redirect()->intended(route('dashboard', absolute: false));
        } catch (\Exception $e) {
            \Log::error('Error en Google OAuth: '.$e->getMessage());

            return redirect()->route('login')->with('error', 'Error al autenticar con Google. Por favor intenta nuevamente.');
        }
    }
}
