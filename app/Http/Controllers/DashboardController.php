<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Discount;
use App\Models\Expense;
use App\Models\ExpenseDetail;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Fecha por defecto: día 24 del mes anterior
        $defaultStartDate = now()->subMonth()->day(24)->toDateString();
        // Fecha por defecto: día 24 del mes actual
        $defaultEndDate = now()->day(24)->toDateString();

        // Si no hay fechas en el request, usar las fechas por defecto
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (!$startDate) {
            $startDate = $defaultStartDate;
        }

        if (!$endDate) {
            $endDate = $defaultEndDate;
        }

        // Guardar las fechas originales para mostrarlas en los filtros
        $filterStartDate = $startDate;
        $filterEndDate = $endDate;

        // Validar fechas contra los límites de la base de datos solo para las consultas
        // pero mantener las fechas originales para los filtros
        $minExpenseDate = Expense::min('expense_date');
        $maxExpenseDate = Expense::max('expense_date');

        // Ajustar fechas solo para las consultas, no para los filtros mostrados
        $queryStartDate = $startDate;
        $queryEndDate = $endDate;

        if ($minExpenseDate && $queryStartDate < $minExpenseDate) {
            $queryStartDate = $minExpenseDate;
        }

        if ($maxExpenseDate && $queryEndDate > $maxExpenseDate) {
            $queryEndDate = $maxExpenseDate;
        }

        // Widgets de estadísticas (usar fechas ajustadas para la consulta)
        $expenses = Expense::whereBetween('expense_date', [$queryStartDate, $queryEndDate])
            ->with(['expenseDetails', 'expenseDiscounts'])
            ->get();

        $totalExpenses = $expenses->sum('total');
        $numberOfExpenses = $expenses->count();

        $numberOfExpenseDetails = ExpenseDetail::whereHas('expense', function ($query) use ($queryStartDate, $queryEndDate) {
            $query->whereBetween('expense_date', [$queryStartDate, $queryEndDate]);
        })->count();

        // Gráfico de barras: Gastos totales por día
        $expensesByDay = $expenses
            ->groupBy(function ($expense) {
                return $expense->expense_date->format('Y-m-d');
            })
            ->map(function ($dayExpenses, $date) {
                return [
                    'date' => $date,
                    'total' => $dayExpenses->sum('total'),
                ];
            })
            ->values()
            ->sortBy('date')
            ->values();

        // Diagrama de torta: Principales detalles de gastos (por monto total)
        $topExpenseDetails = ExpenseDetail::whereHas('expense', function ($query) use ($queryStartDate, $queryEndDate) {
            $query->whereBetween('expense_date', [$queryStartDate, $queryEndDate]);
        })
            ->selectRaw('name, SUM(amount * quantity) as total_amount')
            ->groupBy('name')
            ->orderByDesc('total_amount')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'value' => (float) $item->total_amount,
                ];
            });

        $totalDetailsAmount = $topExpenseDetails->sum('value');
        $expenseDetailsByPercentage = $topExpenseDetails->map(function ($item) use ($totalDetailsAmount) {
            return [
                'name' => $item['name'],
                'value' => $item['value'],
                'percentage' => $totalDetailsAmount > 0 ? round(($item['value'] / $totalDetailsAmount) * 100, 2) : 0,
            ];
        });

        // Diagrama de torta: Por categorías
        $expensesByCategory = ExpenseDetail::whereHas('expense', function ($query) use ($queryStartDate, $queryEndDate) {
            $query->whereBetween('expense_date', [$queryStartDate, $queryEndDate]);
        })
            ->with('category')
            ->selectRaw('category_id, SUM(amount * quantity) as total_amount')
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name ?? 'Sin categoría',
                    'value' => (float) $item->total_amount,
                ];
            })
            ->sortByDesc('value')
            ->values();

        // Diagrama de torta: Por medio de pago
        $expensesByPaymentMethod = $expenses
            ->groupBy('payment_method_id')
            ->map(function ($methodExpenses, $paymentMethodId) {
                $paymentMethod = $methodExpenses->first()->paymentMethod;
                return [
                    'name' => $paymentMethod->name ?? 'Sin método de pago',
                    'value' => $methodExpenses->sum('total'),
                ];
            })
            ->sortByDesc('value')
            ->values();

        // Diagrama de torta: Por descuentos
        $expensesByDiscount = \App\Models\ExpenseDiscount::whereHas('expense', function ($query) use ($queryStartDate, $queryEndDate) {
            $query->whereBetween('expense_date', [$queryStartDate, $queryEndDate]);
        })
            ->with('discount')
            ->selectRaw('discount_id, SUM(discount_amount) as total_amount')
            ->groupBy('discount_id')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->discount->name ?? 'Sin descuento',
                    'value' => (float) $item->total_amount,
                ];
            })
            ->sortByDesc('value')
            ->values();

        return Inertia::render('dashboard', [
            'statistics' => [
                'total_expenses' => $totalExpenses,
                'number_of_expenses' => $numberOfExpenses,
                'number_of_expense_details' => $numberOfExpenseDetails,
            ],
            'charts' => [
                'expenses_by_day' => $expensesByDay,
                'expense_details_by_percentage' => $expenseDetailsByPercentage,
                'expenses_by_category' => $expensesByCategory,
                'expenses_by_payment_method' => $expensesByPaymentMethod,
                'expenses_by_discount' => $expensesByDiscount,
            ],
            'filters' => [
                'start_date' => $filterStartDate,
                'end_date' => $filterEndDate,
            ],
        ]);
    }
}

