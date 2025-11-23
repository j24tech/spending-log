<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateExpenseDocumentRequest;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExpenseApiController extends Controller
{
    /**
     * Display a listing of expenses.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);

        $expenses = Expense::with(['paymentMethod', 'expenseDetails.category', 'expenseDiscounts.discount'])
            ->latest()
            ->paginate($perPage);

        return response()->json($expenses);
    }

    /**
     * Display the specified expense.
     */
    public function show(Expense $expense): JsonResponse
    {
        $expense->load(['paymentMethod', 'expenseDetails.category', 'expenseDiscounts.discount']);

        return response()->json([
            'data' => $expense,
        ]);
    }

    /**
     * Update document number and/or document image.
     */
    public function update(UpdateExpenseDocumentRequest $request, Expense $expense): JsonResponse
    {
        $validated = $request->validated();
        $updated = false;

        // Actualizar número de documento si se proporciona
        if (isset($validated['document_number'])) {
            $expense->document_number = $validated['document_number'];
            $updated = true;
        }

        // Manejar imagen del documento
        if ($request->hasFile('document')) {
            // Eliminar imagen anterior si existe
            if ($expense->document_path) {
                Storage::delete($expense->document_path);
            }

            // Guardar nueva imagen
            $path = $request->file('document')->store('expense-documents', 'public');
            $expense->document_path = $path;
            $updated = true;
        }

        // Eliminar imagen si se solicita
        if ($request->has('delete_document') && $validated['delete_document']) {
            if ($expense->document_path) {
                Storage::delete($expense->document_path);
                $expense->document_path = null;
                $updated = true;
            }
        }

        if ($updated) {
            $expense->save();
        }

        $expense->load(['paymentMethod', 'expenseDetails.category', 'expenseDiscounts.discount']);

        return response()->json([
            'message' => 'Gasto actualizado exitosamente',
            'data' => $expense,
        ]);
    }

    /**
     * Get expense statistics.
     */
    public function statistics(): JsonResponse
    {
        $totalExpenses = Expense::count();
        $totalAmount = Expense::with(['expenseDetails', 'expenseDiscounts'])
            ->get()
            ->sum(function ($expense) {
                $subtotal = $expense->expenseDetails->sum(function ($detail) {
                    return $detail->amount * $detail->quantity;
                });

                $totalDiscounts = $expense->expenseDiscounts->sum('discount_amount');

                return $subtotal - $totalDiscounts;
            });

        $thisMonthExpenses = Expense::whereYear('expense_date', now()->year)
            ->whereMonth('expense_date', now()->month)
            ->count();

        return response()->json([
            'total_expenses' => $totalExpenses,
            'total_amount' => number_format($totalAmount, 2, '.', ''),
            'this_month_expenses' => $thisMonthExpenses,
        ]);
    }
}
