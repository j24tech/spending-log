<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Expense;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create users
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'authorized' => true,
                'is_admin' => false,
            ]
        );

        // Administrador principal - Solo Google OAuth
        $user = User::firstOrCreate(
            ['email' => 'jesusdasilva@gmail.com'],
            [
                'name' => 'Jesus da Silva',
                'password' => null, // Solo Google OAuth
                'email_verified_at' => now(),
                'authorized' => true,
                'is_admin' => true,
            ]
        );

        // Create payment methods
        $paymentMethods = [
            'Efectivo',
            'Tarjeta de Débito',
            'Tarjeta de Crédito',
            'Transferencia Bancaria',
            'Cheque',
        ];

        foreach ($paymentMethods as $pm) {
            PaymentMethod::firstOrCreate(['name' => $pm]);
        }

        // Create categories
        $categories = [
            'Alimentación',
            'Transporte',
            'Servicios Públicos',
            'Entretenimiento',
            'Salud',
            'Educación',
            'Vestimenta',
            'Tecnología',
            'Hogar',
            'Otros',
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['name' => $cat]);
        }

        // Create sample expenses for the user
        $allCategories = Category::all();
        $allPaymentMethods = PaymentMethod::all();

        if ($allCategories->count() > 0 && $allPaymentMethods->count() > 0) {
            // Get a few categories and payment methods for sample expenses
            $sampleCategories = $allCategories->take(5);
            $samplePaymentMethods = $allPaymentMethods->take(3);

            // Create some sample expenses
            for ($i = 0; $i < 5; $i++) {
                $expense = Expense::create([
                    'name' => 'Gasto de Prueba '.($i + 1),
                    'expense_date' => now()->subDays($i)->format('Y-m-d'),
                    'observation' => $i % 2 === 0 ? 'Observación de prueba '.($i + 1) : null,
                    'document_number' => $i < 2 ? 'DOC-'.str_pad($i + 1, 3, '0', STR_PAD_LEFT) : null,
                    'document_path' => null,
                    'payment_method_id' => $samplePaymentMethods->random()->id,
                    'discount' => $i % 3 === 0 ? (float) rand(5, 20) : 0.00,
                ]);

                // Create expense details for each expense
                for ($j = 0; $j < rand(1, 3); $j++) {
                    $expense->expenseDetails()->create([
                        'name' => 'Detalle '.($j + 1),
                        'amount' => (float) rand(1000, 50000) / 100,
                        'quantity' => rand(1, 5),
                        'observation' => $j === 0 ? 'Observación del detalle' : null,
                        'category_id' => $sampleCategories->random()->id,
                    ]);
                }
            }
        }
    }
}
