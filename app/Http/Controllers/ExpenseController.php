<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Models\Category;
use App\Models\Expense;
use App\Models\ExpenseDetail;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $expenses = Expense::with(['expenseDetails.category', 'paymentMethod'])
            ->latest('expense_date')
            ->get()
            ->map(function ($expense) {
                return [
                    ...$expense->toArray(),
                    'total' => $expense->total,
                ];
            });

        $categories = Category::orderBy('name')->get();

        return Inertia::render('expenses/index', [
            'expenses' => $expenses,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $categories = Category::orderBy('name')->get();
        $paymentMethods = PaymentMethod::orderBy('name')->get();

        return Inertia::render('expenses/create', [
            'categories' => $categories,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ExpenseRequest $request): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();
            
            // Handle document upload
            if ($request->hasFile('document')) {
                $path = $request->file('document')->store('expense-documents', 'public');
                $data['document_path'] = $path;
            }

            // Create expense
            $expense = Expense::create([
                'name' => $data['name'],
                'expense_date' => $data['expense_date'],
                'observation' => $data['observation'] ?? null,
                'document_number' => $data['document_number'] ?? null,
                'document_path' => $data['document_path'] ?? null,
                'payment_method_id' => $data['payment_method_id'],
            ]);

            // Create expense details
            foreach ($data['details'] as $detail) {
                $expense->expenseDetails()->create([
                    'name' => $detail['name'],
                    'amount' => $detail['amount'],
                    'quantity' => $detail['quantity'],
                    'observation' => $detail['observation'] ?? null,
                    'category_id' => $detail['category_id'],
                ]);
            }

            DB::commit();

            return to_route('expenses.index')->with('success', 'Gasto creado exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al crear el gasto: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Expense $expense): Response
    {
        $expense->load(['expenseDetails.category', 'paymentMethod']);
        
        $categories = Category::orderBy('name')->get();
        $paymentMethods = PaymentMethod::orderBy('name')->get();

        return Inertia::render('expenses/edit', [
            'expense' => $expense,
            'categories' => $categories,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ExpenseRequest $request, Expense $expense): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $data = $request->validated();

            // Handle document upload
            if ($request->hasFile('document')) {
                // Delete old document if exists
                if ($expense->document_path) {
                    Storage::disk('public')->delete($expense->document_path);
                }
                $path = $request->file('document')->store('expense-documents', 'public');
                $data['document_path'] = $path;
            }

            // Update expense
            $expense->update([
                'name' => $data['name'],
                'expense_date' => $data['expense_date'],
                'observation' => $data['observation'] ?? null,
                'document_number' => $data['document_number'] ?? null,
                'document_path' => $data['document_path'] ?? $expense->document_path,
                'payment_method_id' => $data['payment_method_id'],
            ]);

            // Process expense details
            $existingDetailIds = $expense->expenseDetails()->pluck('id')->toArray();
            $processedIds = [];

            foreach ($data['details'] as $detail) {
                // Skip details marked for deletion
                if (isset($detail['_destroy']) && $detail['_destroy']) {
                    if (isset($detail['id'])) {
                        // Delete existing detail
                        ExpenseDetail::where('id', $detail['id'])
                            ->where('expense_id', $expense->id)
                            ->delete();
                    }
                    continue;
                }

                if (isset($detail['id'])) {
                    // Update existing detail
                    $existingDetail = ExpenseDetail::where('id', $detail['id'])
                        ->where('expense_id', $expense->id)
                        ->first();
                    
                    if ($existingDetail) {
                        $existingDetail->update([
                            'name' => $detail['name'],
                            'amount' => $detail['amount'],
                            'quantity' => $detail['quantity'],
                            'observation' => $detail['observation'] ?? null,
                            'category_id' => $detail['category_id'],
                        ]);
                        $processedIds[] = $detail['id'];
                    }
                } else {
                    // Create new detail
                    $newDetail = $expense->expenseDetails()->create([
                        'name' => $detail['name'],
                        'amount' => $detail['amount'],
                        'quantity' => $detail['quantity'],
                        'observation' => $detail['observation'] ?? null,
                        'category_id' => $detail['category_id'],
                    ]);
                    $processedIds[] = $newDetail->id;
                }
            }

            // Delete details that were not in the submitted data (removed without _destroy flag)
            $detailsToDelete = array_diff($existingDetailIds, $processedIds);
            if (!empty($detailsToDelete)) {
                ExpenseDetail::whereIn('id', $detailsToDelete)
                    ->where('expense_id', $expense->id)
                    ->delete();
            }

            DB::commit();

            return to_route('expenses.index')->with('success', 'Gasto actualizado exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al actualizar el gasto: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense): RedirectResponse
    {
        try {
            // Delete document if exists
            if ($expense->document_path) {
                Storage::disk('public')->delete($expense->document_path);
            }

            $expense->delete();

            return to_route('expenses.index')->with('success', 'Gasto eliminado exitosamente');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al eliminar el gasto: ' . $e->getMessage());
        }
    }

    /**
     * Update a specific expense detail.
     */
    public function updateDetail(Request $request, Expense $expense, ExpenseDetail $detail): RedirectResponse
    {
        // Verify the detail belongs to the expense
        if ($detail->expense_id !== $expense->id) {
            return back()->with('error', 'El detalle no pertenece a este gasto');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'amount' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
            'quantity' => ['required', 'numeric', 'min:0.01', 'decimal:0,2'],
            'observation' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
        ]);

        $detail->update($validated);

        return back()->with('success', 'Detalle actualizado exitosamente');
    }

    /**
     * Remove a specific expense detail.
     */
    public function destroyDetail(Expense $expense, ExpenseDetail $detail): RedirectResponse
    {
        // Verify the detail belongs to the expense
        if ($detail->expense_id !== $expense->id) {
            return back()->with('error', 'El detalle no pertenece a este gasto');
        }

        // Check if it's the last detail
        if ($expense->expenseDetails()->count() <= 1) {
            return back()->with('error', 'No se puede eliminar el último detalle del gasto');
        }

        $detail->delete();

        return back()->with('success', 'Detalle eliminado exitosamente');
    }
}


