<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotGoogleUser
{
    /**
     * Handle an incoming request.
     *
     * Bloquea el acceso a usuarios que usan Google OAuth
     * para secciones que no aplican (cambio de contraseña, 2FA)
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->google_id) {
            return redirect()->route('profile.edit')
                ->with('info', 'Esta sección no está disponible para usuarios que inician sesión con Google.');
        }

        return $next($request);
    }
}
