<?php

namespace Database\Factories;

use App\Models\Discount;
use App\Models\Expense;
use App\Models\ExpenseDiscount;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExpenseDiscount>
 */
class ExpenseDiscountFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\Illuminate\Database\Eloquent\Model>
     */
    protected $model = ExpenseDiscount::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'discount_id' => Discount::factory(),
            'expense_id' => Expense::factory(),
            'observation' => fake()->optional()->sentence(),
            'discount_amount' => fake()->randomFloat(2, 1, 100),
        ];
    }
}
