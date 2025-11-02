<?php

use App\Models\Category;
use App\Models\Expense;
use App\Models\ExpenseDetail;
use App\Models\PaymentMethod;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('puede listar los gastos cuando está autenticado', function () {
    $expense = Expense::factory()
        ->has(ExpenseDetail::factory()->count(2), 'expenseDetails')
        ->create();

    $response = $this->actingAs($this->user)->get('/expenses');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('expenses/index')
        ->has('expenses.data', 1)
    );
});

test('no puede listar los gastos cuando no está autenticado', function () {
    $response = $this->get('/expenses');

    $response->assertRedirect('/login');
});

test('puede ver el formulario de creación de gasto', function () {
    Category::factory()->count(3)->create();
    PaymentMethod::factory()->count(2)->create();

    $response = $this->actingAs($this->user)->get('/expenses/create');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('expenses/create')
        ->has('categories', 3)
        ->has('paymentMethods', 2)
    );
});

test('puede crear un gasto con datos válidos', function () {
    $category = Category::factory()->create();
    $paymentMethod = PaymentMethod::factory()->create();

    $expenseData = [
        'name' => 'Gasto de prueba',
        'expense_date' => now()->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => '10.50',
        'observation' => 'Observación de prueba',
        'document_number' => 'DOC-12345',
        'details' => [
            [
                'name' => 'Detalle 1',
                'amount' => '100.00',
                'quantity' => '2',
                'category_id' => $category->id,
                'observation' => 'Observación del detalle',
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->post('/expenses', $expenseData);

    $response->assertRedirect('/expenses');
    $response->assertSessionHas('success', 'Gasto creado exitosamente');

    $this->assertDatabaseHas('expenses', [
        'name' => 'Gasto de prueba',
        'expense_date' => now()->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => 10.50,
        'observation' => 'Observación de prueba',
        'document_number' => 'DOC-12345',
    ]);

    $this->assertDatabaseHas('expense_details', [
        'name' => 'Detalle 1',
        'amount' => 100.00,
        'quantity' => 2,
        'category_id' => $category->id,
        'observation' => 'Observación del detalle',
    ]);
});

test('no puede crear un gasto sin datos requeridos', function () {
    $response = $this->actingAs($this->user)->post('/expenses', []);

    $response->assertSessionHasErrors(['name', 'expense_date', 'payment_method_id', 'details']);
});

test('no puede crear un gasto con descuento mayor al subtotal', function () {
    $category = Category::factory()->create();
    $paymentMethod = PaymentMethod::factory()->create();

    $expenseData = [
        'name' => 'Gasto de prueba',
        'expense_date' => now()->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => '1000.00', // Descuento mayor al subtotal
        'details' => [
            [
                'name' => 'Detalle 1',
                'amount' => '100.00',
                'quantity' => '2', // Subtotal = 200
                'category_id' => $category->id,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->post('/expenses', $expenseData);

    $response->assertSessionHasErrors(['discount']);
});

test('puede crear un gasto con documento adjunto', function () {
    $category = Category::factory()->create();
    $paymentMethod = PaymentMethod::factory()->create();

    $file = \Illuminate\Http\UploadedFile::fake()->image('document.png');

    $expenseData = [
        'name' => 'Gasto con documento',
        'expense_date' => now()->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => '0',
        'document' => $file,
        'details' => [
            [
                'name' => 'Detalle 1',
                'amount' => '100.00',
                'quantity' => '1',
                'category_id' => $category->id,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->post('/expenses', $expenseData);

    $response->assertRedirect('/expenses');

    $expense = Expense::where('name', 'Gasto con documento')->first();
    expect($expense->document_path)->not->toBeNull();
    \Illuminate\Support\Facades\Storage::disk('public')->assertExists($expense->document_path);
});

test('puede ver el formulario de edición de gasto', function () {
    $expense = Expense::factory()
        ->has(ExpenseDetail::factory()->count(2), 'expenseDetails')
        ->create();

    Category::factory()->count(3)->create();
    PaymentMethod::factory()->count(2)->create();

    $response = $this->actingAs($this->user)->get("/expenses/{$expense->id}/edit");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('expenses/edit')
        ->has('expense')
        ->has('categories')
        ->has('paymentMethods')
    );
});

test('puede actualizar un gasto con datos válidos', function () {
    $expense = Expense::factory()
        ->has(ExpenseDetail::factory()->count(1), 'expenseDetails')
        ->create();

    $category = Category::factory()->create();
    $paymentMethod = PaymentMethod::factory()->create();

    $updateData = [
        'name' => 'Gasto actualizado',
        'expense_date' => now()->addDay()->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => '5.00',
        'observation' => 'Observación actualizada',
        'details' => [
            [
                'id' => $expense->expenseDetails->first()->id,
                'name' => 'Detalle actualizado',
                'amount' => '150.00',
                'quantity' => '3',
                'category_id' => $category->id,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->put("/expenses/{$expense->id}", $updateData);

    $response->assertRedirect('/expenses');
    $response->assertSessionHas('success', 'Gasto actualizado exitosamente');

    $this->assertDatabaseHas('expenses', [
        'id' => $expense->id,
        'name' => 'Gasto actualizado',
        'discount' => 5.00,
        'observation' => 'Observación actualizada',
    ]);
});

test('puede actualizar un gasto y agregar nuevos detalles', function () {
    $expense = Expense::factory()
        ->has(ExpenseDetail::factory()->count(1), 'expenseDetails')
        ->create();

    $category = Category::factory()->create();
    $paymentMethod = PaymentMethod::factory()->create();

    $updateData = [
        'name' => $expense->name,
        'expense_date' => $expense->expense_date->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => '0',
        'details' => [
            [
                'id' => $expense->expenseDetails->first()->id,
                'name' => $expense->expenseDetails->first()->name,
                'amount' => $expense->expenseDetails->first()->amount,
                'quantity' => $expense->expenseDetails->first()->quantity,
                'category_id' => $expense->expenseDetails->first()->category_id,
            ],
            [
                'name' => 'Nuevo detalle',
                'amount' => '200.00',
                'quantity' => '1',
                'category_id' => $category->id,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->put("/expenses/{$expense->id}", $updateData);

    $response->assertRedirect('/expenses');

    expect($expense->expenseDetails()->count())->toBe(2);
    $this->assertDatabaseHas('expense_details', [
        'expense_id' => $expense->id,
        'name' => 'Nuevo detalle',
    ]);
});

test('puede actualizar un gasto y eliminar detalles', function () {
    $expense = Expense::factory()
        ->has(ExpenseDetail::factory()->count(2), 'expenseDetails')
        ->create();

    $paymentMethod = PaymentMethod::factory()->create();
    $detailToKeep = $expense->expenseDetails->first();
    $detailToDelete = $expense->expenseDetails->last();

    $updateData = [
        'name' => $expense->name,
        'expense_date' => $expense->expense_date->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => '0',
        'details' => [
            [
                'id' => $detailToKeep->id,
                'name' => $detailToKeep->name,
                'amount' => $detailToKeep->amount,
                'quantity' => $detailToKeep->quantity,
                'category_id' => $detailToKeep->category_id,
            ],
            [
                'id' => $detailToDelete->id,
                '_destroy' => true,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->put("/expenses/{$expense->id}", $updateData);

    $response->assertRedirect('/expenses');

    expect($expense->expenseDetails()->count())->toBe(1);
    $this->assertDatabaseMissing('expense_details', [
        'id' => $detailToDelete->id,
    ]);
});

test('puede eliminar un gasto', function () {
    $expense = Expense::factory()->create();

    $response = $this->actingAs($this->user)->delete("/expenses/{$expense->id}");

    $response->assertRedirect('/expenses');
    $response->assertSessionHas('success', 'Gasto eliminado exitosamente');

    $this->assertDatabaseMissing('expenses', [
        'id' => $expense->id,
    ]);
});

test('elimina el documento cuando se elimina un gasto', function () {
    $expense = Expense::factory()->create([
        'document_path' => 'expense-documents/test.png',
    ]);

    \Illuminate\Support\Facades\Storage::disk('public')->put($expense->document_path, 'fake content');

    $response = $this->actingAs($this->user)->delete("/expenses/{$expense->id}");

    $response->assertRedirect('/expenses');
    \Illuminate\Support\Facades\Storage::disk('public')->assertMissing($expense->document_path);
});

test('no puede crear un gasto sin al menos un detalle', function () {
    $paymentMethod = PaymentMethod::factory()->create();

    $expenseData = [
        'name' => 'Gasto sin detalles',
        'expense_date' => now()->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => '0',
        'details' => [],
    ];

    $response = $this->actingAs($this->user)->post('/expenses', $expenseData);

    $response->assertSessionHasErrors(['details']);
});

test('no puede crear un gasto con cantidad menor a 1', function () {
    $category = Category::factory()->create();
    $paymentMethod = PaymentMethod::factory()->create();

    $expenseData = [
        'name' => 'Gasto de prueba',
        'expense_date' => now()->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => '0',
        'details' => [
            [
                'name' => 'Detalle 1',
                'amount' => '100.00',
                'quantity' => '0', // Cantidad inválida
                'category_id' => $category->id,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->post('/expenses', $expenseData);

    $response->assertSessionHasErrors(['details.0.quantity']);
});

test('puede actualizar un gasto y cambiar su documento', function () {
    $expense = Expense::factory()
        ->has(ExpenseDetail::factory()->count(1), 'expenseDetails')
        ->create([
            'document_path' => 'expense-documents/old.png',
        ]);

    // Create old file
    \Illuminate\Support\Facades\Storage::disk('public')->put('expense-documents/old.png', 'old content');

    $paymentMethod = PaymentMethod::factory()->create();

    $newFile = \Illuminate\Http\UploadedFile::fake()->image('new-document.png');

    $updateData = [
        'name' => $expense->name,
        'expense_date' => $expense->expense_date->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => '0',
        'document' => $newFile,
        'details' => [
            [
                'id' => $expense->expenseDetails->first()->id,
                'name' => $expense->expenseDetails->first()->name,
                'amount' => $expense->expenseDetails->first()->amount,
                'quantity' => $expense->expenseDetails->first()->quantity,
                'category_id' => $expense->expenseDetails->first()->category_id,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->put("/expenses/{$expense->id}", $updateData);

    $response->assertRedirect('/expenses');
    $response->assertSessionHas('success', 'Gasto actualizado exitosamente');

    $expense->refresh();
    expect($expense->document_path)->not->toBeNull();
    expect($expense->document_path)->not->toBe('expense-documents/old.png');
    \Illuminate\Support\Facades\Storage::disk('public')->assertExists($expense->document_path);
    \Illuminate\Support\Facades\Storage::disk('public')->assertMissing('expense-documents/old.png');
});

test('puede actualizar un gasto y eliminar su documento', function () {
    $expense = Expense::factory()
        ->has(ExpenseDetail::factory()->count(1), 'expenseDetails')
        ->create([
            'document_path' => 'expense-documents/test.png',
        ]);

    // Create file
    \Illuminate\Support\Facades\Storage::disk('public')->put('expense-documents/test.png', 'test content');

    $paymentMethod = PaymentMethod::factory()->create();

    $updateData = [
        'name' => $expense->name,
        'expense_date' => $expense->expense_date->format('Y-m-d'),
        'payment_method_id' => $paymentMethod->id,
        'discount' => '0',
        'delete_document' => true,
        'details' => [
            [
                'id' => $expense->expenseDetails->first()->id,
                'name' => $expense->expenseDetails->first()->name,
                'amount' => $expense->expenseDetails->first()->amount,
                'quantity' => $expense->expenseDetails->first()->quantity,
                'category_id' => $expense->expenseDetails->first()->category_id,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)->put("/expenses/{$expense->id}", $updateData);

    $response->assertRedirect('/expenses');
    $response->assertSessionHas('success', 'Gasto actualizado exitosamente');

    $expense->refresh();
    expect($expense->document_path)->toBeNull();
    \Illuminate\Support\Facades\Storage::disk('public')->assertMissing('expense-documents/test.png');
});
