<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');

        $query = User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('is_admin', 'desc')
            ->orderBy('authorized', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'authorized' => 'boolean',
            'is_admin' => 'boolean',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'authorized' => $validated['authorized'] ?? true,
            'is_admin' => $validated['is_admin'] ?? false,
            'password' => null, // Solo Google OAuth
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'authorized' => 'boolean',
            'is_admin' => 'boolean',
        ]);

        // Prevenir que el último admin se quite permisos de admin
        if ($user->is_admin && ! $validated['is_admin']) {
            $adminCount = User::where('is_admin', true)->count();
            if ($adminCount <= 1) {
                return back()->withErrors([
                    'is_admin' => 'No puedes remover el rol de administrador del último administrador del sistema.',
                ]);
            }
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'authorized' => $validated['authorized'] ?? $user->authorized,
            'is_admin' => $validated['is_admin'] ?? $user->is_admin,
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevenir eliminar al último admin
        if ($user->is_admin) {
            $adminCount = User::where('is_admin', true)->count();
            if ($adminCount <= 1) {
                return back()->withErrors([
                    'error' => 'No puedes eliminar al último administrador del sistema.',
                ]);
            }
        }

        // Prevenir que un admin se elimine a sí mismo
        if ($user->id === auth()->id()) {
            return back()->withErrors([
                'error' => 'No puedes eliminarte a ti mismo.',
            ]);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario eliminado exitosamente.');
    }

    /**
     * Toggle user authorization status.
     */
    public function toggleAuthorization(User $user): RedirectResponse
    {
        $user->update([
            'authorized' => ! $user->authorized,
        ]);

        $status = $user->authorized ? 'autorizado' : 'desautorizado';

        return back()->with('success', "Usuario {$status} exitosamente.");
    }

    /**
     * Toggle user admin status.
     */
    public function toggleAdmin(User $user): RedirectResponse
    {
        // Si está quitando admin, verificar que no sea el último
        if ($user->is_admin) {
            $adminCount = User::where('is_admin', true)->count();
            if ($adminCount <= 1) {
                return back()->withErrors([
                    'error' => 'No puedes remover el rol de administrador del último administrador del sistema.',
                ]);
            }
        }

        $user->update([
            'is_admin' => ! $user->is_admin,
            'authorized' => true, // Un admin siempre debe estar autorizado
        ]);

        $status = $user->is_admin ? 'promovido a administrador' : 'removido como administrador';

        return back()->with('success', "Usuario {$status} exitosamente.");
    }
}
