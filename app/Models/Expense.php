<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Expense extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'expense_date',
        'observation',
        'document_number',
        'document_path',
        'payment_method_id',
        'tags',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expense_date' => 'date:Y-m-d',
        'tags' => 'array',
    ];

    /**
     * Get the expense details for the expense.
     */
    public function expenseDetails(): HasMany
    {
        return $this->hasMany(ExpenseDetail::class);
    }

    /**
     * Get the expense discounts for the expense.
     */
    public function expenseDiscounts(): HasMany
    {
        return $this->hasMany(ExpenseDiscount::class);
    }

    /**
     * Get the payment method that owns the expense.
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Get the total amount of the expense (subtotal - all discounts).
     */
    public function getTotalAttribute(): float
    {
        $subtotal = $this->expenseDetails->sum(function ($detail) {
            return $detail->amount * $detail->quantity;
        });

        // Sumar todos los descuentos aplicados
        $totalDiscounts = $this->expenseDiscounts->sum('discount_amount');

        return max(0, $subtotal - $totalDiscounts);
    }

    /**
     * Get the total discounts amount.
     */
    public function getTotalDiscountsAttribute(): float
    {
        return $this->expenseDiscounts->sum('discount_amount');
    }
}
