<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Discount;
use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class ExampleDataWithTagsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear categorías con tags
        $categories = [
            [
                'name' => 'Alimentación',
                'tags' => ['comida', 'supermercado', 'restaurante'],
            ],
            [
                'name' => 'Transporte',
                'tags' => ['gasolina', 'uber', 'taxi', 'transporte'],
            ],
            [
                'name' => 'Servicios Públicos',
                'tags' => ['luz', 'agua', 'internet', 'servicios'],
            ],
            [
                'name' => 'Salud',
                'tags' => ['medicina', 'farmacia', 'doctor', 'salud'],
            ],
            [
                'name' => 'Entretenimiento',
                'tags' => ['cine', 'streaming', 'diversión'],
            ],
            [
                'name' => 'Educación',
                'tags' => ['libros', 'cursos', 'educación'],
            ],
        ];

        foreach ($categories as $categoryData) {
            $category = Category::firstOrCreate(
                ['name' => $categoryData['name']],
                ['tags' => $categoryData['tags'], 'is_active' => true]
            );

            // Si ya existe, actualizar los tags
            if ($category->wasRecentlyCreated === false) {
                $category->update(['tags' => $categoryData['tags']]);
            }
        }

        // Crear métodos de pago con tags
        $paymentMethods = [
            [
                'name' => 'Efectivo',
                'tags' => ['efectivo', 'dinero', 'presencial'],
            ],
            [
                'name' => 'Tarjeta de Débito',
                'tags' => ['débito', 'banco', 'tarjeta'],
            ],
            [
                'name' => 'Tarjeta de Crédito',
                'tags' => ['crédito', 'banco', 'tarjeta', 'financiado'],
            ],
            [
                'name' => 'Transferencia Bancaria',
                'tags' => ['transferencia', 'banco', 'digital'],
            ],
            [
                'name' => 'Cheque',
                'tags' => ['cheque', 'banco', 'documento'],
            ],
        ];

        foreach ($paymentMethods as $pmData) {
            $paymentMethod = PaymentMethod::firstOrCreate(
                ['name' => $pmData['name']],
                ['tags' => $pmData['tags'], 'is_active' => true]
            );

            // Si ya existe, actualizar los tags
            if ($paymentMethod->wasRecentlyCreated === false) {
                $paymentMethod->update(['tags' => $pmData['tags']]);
            }
        }

        // Crear tipos de descuento con tags
        $discounts = [
            [
                'name' => 'Descuento por Volumen',
                'tags' => ['volumen', 'cantidad', 'descuento'],
            ],
            [
                'name' => 'Descuento por Pago Anticipado',
                'tags' => ['anticipado', 'pago', 'descuento'],
            ],
            [
                'name' => 'Descuento por Cliente Frecuente',
                'tags' => ['frecuente', 'cliente', 'fidelidad'],
            ],
            [
                'name' => 'Descuento Promocional',
                'tags' => ['promoción', 'oferta', 'temporal'],
            ],
            [
                'name' => 'Descuento por Temporada',
                'tags' => ['temporada', 'estacional', 'especial'],
            ],
        ];

        foreach ($discounts as $discountData) {
            $discount = Discount::firstOrCreate(
                ['name' => $discountData['name']],
                ['tags' => $discountData['tags'], 'is_active' => true]
            );

            // Si ya existe, actualizar los tags
            if ($discount->wasRecentlyCreated === false) {
                $discount->update(['tags' => $discountData['tags']]);
            }
        }

        $this->command->info('✅ Datos de ejemplo con tags creados exitosamente!');
        $this->command->info('   - Categorías: '.count($categories));
        $this->command->info('   - Métodos de pago: '.count($paymentMethods));
        $this->command->info('   - Tipos de descuento: '.count($discounts));
    }
}
