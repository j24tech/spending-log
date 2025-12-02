<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\ExpenseDetail;
use App\Models\ExpenseDiscount;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ExpenseService
{
    /**
     * Create a new expense with its details.
     *
     * @param  array<string, mixed>  $data
     */
    public function createExpense(array $data): Expense
    {
        return DB::transaction(function () use ($data) {
            // Handle document upload
            if (isset($data['document']) && $data['document'] instanceof UploadedFile) {
                $data['document_path'] = $this->storeDocument($data['document']);
            }
            unset($data['document']);

            // Create expense
            $expense = Expense::create([
                'name' => $data['name'],
                'expense_date' => $data['expense_date'],
                'observation' => $data['observation'] ?? null,
                'document_number' => $data['document_number'] ?? null,
                'document_path' => $data['document_path'] ?? null,
                'payment_method_id' => $data['payment_method_id'],
                'tags' => $data['tags'] ?? null,
            ]);

            // Create expense details
            $this->createExpenseDetails($expense, $data['details'] ?? []);

            // Create expense discounts
            $this->createExpenseDiscounts($expense, $data['expense_discounts'] ?? []);

            return $expense->fresh(['expenseDetails.category', 'paymentMethod', 'expenseDiscounts.discount']);
        });
    }

    /**
     * Update an existing expense with its details.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateExpense(Expense $expense, array $data): Expense
    {
        return DB::transaction(function () use ($expense, $data) {
            // Determine document_path BEFORE processing to avoid issues with null coalescing
            $documentPath = null;
            $shouldDeleteDocument = isset($data['delete_document']) && $data['delete_document'];

            if ($shouldDeleteDocument) {
                // Document deletion requested
                \Log::info('ExpenseService: Deleting document', [
                    'expense_id' => $expense->id,
                    'document_path' => $expense->document_path,
                    'delete_document_value' => $data['delete_document'],
                    'delete_document_type' => gettype($data['delete_document']),
                ]);
                if ($expense->document_path) {
                    $this->deleteDocument($expense->document_path);
                }
                $documentPath = null; // Explicitly null when deleted
            } elseif (isset($data['document']) && $data['document'] instanceof UploadedFile) {
                // New document uploaded
                // Delete old document before storing new one
                if ($expense->document_path) {
                    $this->deleteDocument($expense->document_path);
                }
                $documentPath = $this->storeDocument($data['document']);
            } else {
                // No change to document, keep existing
                $documentPath = $expense->document_path;
            }

            unset($data['document'], $data['delete_document']);

            // Update expense
            // document_path is already determined above ($documentPath variable)
            // It will be: null if deleted, new path if uploaded, or existing path if no change
            $expense->update([
                'name' => $data['name'],
                'expense_date' => $data['expense_date'],
                'observation' => $data['observation'] ?? null,
                'document_number' => $data['document_number'] ?? null,
                'document_path' => $documentPath, // Explicitly null if deleted, new path if uploaded, or existing if no change
                'payment_method_id' => $data['payment_method_id'],
                'tags' => $data['tags'] ?? null,
            ]);

            // Update expense details
            $this->updateExpenseDetails($expense, $data['details'] ?? []);

            // Update expense discounts
            $this->updateExpenseDiscounts($expense, $data['expense_discounts'] ?? []);

            return $expense->fresh(['expenseDetails.category', 'paymentMethod', 'expenseDiscounts.discount']);
        });
    }

    /**
     * Delete an expense and its associated document.
     */
    public function deleteExpense(Expense $expense): bool
    {
        return DB::transaction(function () use ($expense) {
            // Delete document if exists
            if ($expense->document_path) {
                $this->deleteDocument($expense->document_path);
            }

            return $expense->delete();
        });
    }

    /**
     * Create expense details for an expense.
     *
     * @param  array<int, array<string, mixed>>  $details
     */
    protected function createExpenseDetails(Expense $expense, array $details): void
    {
        foreach ($details as $detail) {
            $expense->expenseDetails()->create([
                'name' => $detail['name'],
                'amount' => $detail['amount'],
                'quantity' => $detail['quantity'],
                'observation' => $detail['observation'] ?? null,
                'category_id' => $detail['category_id'],
            ]);
        }
    }

    /**
     * Update expense details for an expense.
     *
     * @param  array<int, array<string, mixed>>  $details
     */
    protected function updateExpenseDetails(Expense $expense, array $details): void
    {
        $existingDetailIds = $expense->expenseDetails()->pluck('id')->toArray();
        $processedIds = [];

        foreach ($details as $detail) {
            // Skip details marked for deletion
            if (isset($detail['_destroy']) && $detail['_destroy']) {
                if (isset($detail['id'])) {
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

        // Delete details that were not in the submitted data
        $detailsToDelete = array_diff($existingDetailIds, $processedIds);
        if (! empty($detailsToDelete)) {
            ExpenseDetail::whereIn('id', $detailsToDelete)
                ->where('expense_id', $expense->id)
                ->delete();
        }
    }

    /**
     * Store a document file.
     */
    protected function storeDocument(UploadedFile $file): string
    {
        return $file->store('expense-documents', 'public');
    }

    /**
     * Delete a document file.
     */
    protected function deleteDocument(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Create expense discounts for an expense.
     *
     * @param  array<int, array<string, mixed>>  $discounts
     */
    protected function createExpenseDiscounts(Expense $expense, array $discounts): void
    {
        foreach ($discounts as $discount) {
            // Skip discounts marked for deletion
            if (isset($discount['_destroy']) && $discount['_destroy']) {
                continue;
            }

            $expense->expenseDiscounts()->create([
                'discount_id' => $discount['discount_id'],
                'observation' => $discount['observation'] ?? null,
                'discount_amount' => $discount['discount_amount'],
            ]);
        }
    }

    /**
     * Update expense discounts for an expense.
     *
     * @param  array<int, array<string, mixed>>  $discounts
     */
    protected function updateExpenseDiscounts(Expense $expense, array $discounts): void
    {
        $existingDiscountIds = $expense->expenseDiscounts()->pluck('id')->toArray();
        $processedIds = [];

        foreach ($discounts as $discount) {
            // Skip discounts marked for deletion
            if (isset($discount['_destroy']) && $discount['_destroy']) {
                if (isset($discount['id'])) {
                    ExpenseDiscount::where('id', $discount['id'])
                        ->where('expense_id', $expense->id)
                        ->delete();
                }

                continue;
            }

            if (isset($discount['id'])) {
                // Update existing discount
                $existingDiscount = ExpenseDiscount::where('id', $discount['id'])
                    ->where('expense_id', $expense->id)
                    ->first();

                if ($existingDiscount) {
                    $existingDiscount->update([
                        'discount_id' => $discount['discount_id'],
                        'observation' => $discount['observation'] ?? null,
                        'discount_amount' => $discount['discount_amount'],
                    ]);
                    $processedIds[] = $discount['id'];
                }
            } else {
                // Create new discount
                $newDiscount = $expense->expenseDiscounts()->create([
                    'discount_id' => $discount['discount_id'],
                    'observation' => $discount['observation'] ?? null,
                    'discount_amount' => $discount['discount_amount'],
                ]);
                $processedIds[] = $newDiscount->id;
            }
        }

        // Delete discounts that were not in the submitted data
        $discountsToDelete = array_diff($existingDiscountIds, $processedIds);
        if (! empty($discountsToDelete)) {
            ExpenseDiscount::whereIn('id', $discountsToDelete)
                ->where('expense_id', $expense->id)
                ->delete();
        }
    }
}
