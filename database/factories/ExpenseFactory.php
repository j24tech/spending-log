<?php

namespace Database\Factories;

use App\Models\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Expense>
 */
class ExpenseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'expense_date' => fake()->date(),
            'observation' => fake()->optional()->sentence(),
            'document_number' => fake()->optional()->numerify('DOC-#####'),
            'document_path' => null,
            'payment_method_id' => PaymentMethod::factory(),
            'discount' => fake()->randomFloat(2, 0, 100),
        ];
    }
}
