<?php

use App\Http\Controllers\Admin\UserManagementController;
use Illuminate\Support\Facades\Route;

// Rutas de administración - Solo accesibles para admins
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Gestión de usuarios
    Route::resource('users', UserManagementController::class);

    // Acciones adicionales de usuarios
    Route::post('users/{user}/toggle-authorization', [UserManagementController::class, 'toggleAuthorization'])
        ->name('users.toggle-authorization');

    Route::post('users/{user}/toggle-admin', [UserManagementController::class, 'toggleAdmin'])
        ->name('users.toggle-admin');
});
