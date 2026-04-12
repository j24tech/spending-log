<?php

use App\Http\Controllers\Api\ExpenseApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rutas de la API REST para Spending Log.
| Todas las rutas requieren autenticación con Sanctum.
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // Gastos - Solo lectura y actualización limitada
    Route::get('/expenses', [ExpenseApiController::class, 'index'])
        ->name('api.expenses.index');

    // Estadísticas (antes de /expenses/{expense} para que "statistics" no se interprete como id)
    Route::get('/expenses/statistics', [ExpenseApiController::class, 'statistics'])
        ->name('api.expenses.statistics');

    Route::get('/expenses/{expense}', [ExpenseApiController::class, 'show'])
        ->name('api.expenses.show');

    Route::post('/expenses/{expense}/document', [ExpenseApiController::class, 'update'])
        ->name('api.expenses.update-document');
});
