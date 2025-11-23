<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Payment Methods CRUD
    Route::resource('payment-methods', App\Http\Controllers\PaymentMethodController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    // Categories CRUD
    Route::resource('categories', App\Http\Controllers\CategoryController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    // Discounts CRUD
    Route::resource('discounts', App\Http\Controllers\DiscountController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    // Expenses CRUD
    Route::resource('expenses', App\Http\Controllers\ExpenseController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    // Expense Details management (within expense context)
    Route::put('expenses/{expense}/details/{detail}', [App\Http\Controllers\ExpenseController::class, 'updateDetail'])
        ->name('expenses.details.update');
    Route::delete('expenses/{expense}/details/{detail}', [App\Http\Controllers\ExpenseController::class, 'destroyDetail'])
        ->name('expenses.details.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
