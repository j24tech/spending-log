<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Expense;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExpenseDetail>
 */
class ExpenseDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'expense_id' => Expense::factory(),
            'name' => fake()->words(2, true),
            'amount' => fake()->randomFloat(2, 10, 1000),
            'quantity' => fake()->numberBetween(1, 10),
            'observation' => fake()->optional()->sentence(),
            'category_id' => Category::factory(),
        ];
    }
}
