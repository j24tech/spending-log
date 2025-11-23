<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Models\Category;
use App\Models\Discount;
use App\Models\Expense;
use App\Models\ExpenseDetail;
use App\Models\PaymentMethod;
use App\Services\ExpenseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function __construct(
        protected ExpenseService $expenseService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $perPage = request('per_page', 10);
        $expenses = Expense::with(['expenseDetails.category', 'expenseDiscounts.discount', 'paymentMethod'])
            ->latest('expense_date')
            ->paginate($perPage);

        // Transform the collection to add the total and normalize document_path
        $expenses->getCollection()->transform(function ($expense) {
            $data = $expense->toArray();
            // Normalize document_path: convert empty string, null, or whitespace-only to null
            // IMPORTANT: Unset null values so they don't appear in JSON (Inertia will omit them)
            // This ensures the frontend receives undefined instead of null, which is easier to check
            if (! isset($data['document_path']) ||
                $data['document_path'] === null ||
                (is_string($data['document_path']) && trim($data['document_path']) === '')) {
                // Remove the key entirely if null/empty so it won't be in JSON
                unset($data['document_path']);
            }

            return [
                ...$data,
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
        $discounts = Discount::orderBy('name')->get();

        return Inertia::render('expenses/create', [
            'categories' => $categories,
            'paymentMethods' => $paymentMethods,
            'discounts' => $discounts,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ExpenseRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();

            // Handle document file if present
            if ($request->hasFile('document')) {
                $data['document'] = $request->file('document');
            }

            $this->expenseService->createExpense($data);

            return to_route('expenses.index');
        } catch (\Exception $e) {
            \Log::error('Error creating expense', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back();
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Expense $expense): Response
    {
        $expense->load(['expenseDetails.category', 'expenseDiscounts.discount', 'paymentMethod']);

        $categories = Category::orderBy('name')->get();
        $paymentMethods = PaymentMethod::orderBy('name')->get();
        $discounts = Discount::orderBy('name')->get();

        return Inertia::render('expenses/edit', [
            'expense' => $expense,
            'categories' => $categories,
            'paymentMethods' => $paymentMethods,
            'discounts' => $discounts,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ExpenseRequest $request, Expense $expense): RedirectResponse
    {
        try {
            $data = $request->validated();

            // Handle document file if present
            if ($request->hasFile('document')) {
                $data['document'] = $request->file('document');
            }

            // Ensure delete_document flag is passed if present
            // It should already be in validated() data, but ensure it's boolean
            if ($request->has('delete_document')) {
                $data['delete_document'] = filter_var($request->input('delete_document'), FILTER_VALIDATE_BOOLEAN);
            }

            $this->expenseService->updateExpense($expense, $data);

            return to_route('expenses.index');
        } catch (\Exception $e) {
            \Log::error('Error updating expense', [
                'expense_id' => $expense->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense): RedirectResponse
    {
        try {
            $this->expenseService->deleteExpense($expense);

            return to_route('expenses.index');
        } catch (\Exception $e) {
            \Log::error('Error deleting expense', [
                'expense_id' => $expense->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back();
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
            'quantity' => ['required', 'integer', 'min:1'],
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
