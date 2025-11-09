<?php

use App\Models\Expense;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->token = $this->user->createToken('test-token')->plainTextToken;
});

test('requiere autenticación para acceder a la API', function () {
    $response = $this->getJson('/api/expenses');

    $response->assertStatus(401);
});

test('puede listar gastos con autenticación', function () {
    Expense::factory()->count(5)->create();

    $response = $this->withToken($this->token)
        ->getJson('/api/expenses');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'expense_date',
                    'document_number',
                    'document_path',
                    'payment_method',
                    'expense_details',
                ],
            ],
            'current_page',
            'last_page',
            'per_page',
            'total',
        ]);
});

test('puede obtener un gasto específico', function () {
    $expense = Expense::factory()->create([
        'name' => 'Gasto de Prueba',
        'document_number' => 'DOC-001',
    ]);

    $response = $this->withToken($this->token)
        ->getJson("/api/expenses/{$expense->id}");

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => $expense->id,
                'name' => 'Gasto de Prueba',
                'document_number' => 'DOC-001',
            ],
        ]);
});

test('puede actualizar el número de documento', function () {
    $expense = Expense::factory()->create([
        'document_number' => 'DOC-001',
    ]);

    $response = $this->withToken($this->token)
        ->postJson('/api/expenses/{expense->id}/document', [
            'document_number' => 'FACTURA-2025-001',
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Gasto actualizado exitosamente',
        ]);

    $expense->refresh();
    expect($expense->document_number)->toBe('FACTURA-2025-001');
});

test('puede actualizar la imagen del documento', function () {
    Storage::fake('public');

    $expense = Expense::factory()->create([
        'document_path' => null,
    ]);

    $file = UploadedFile::fake()->image('factura.jpg');

    $response = $this->withToken($this->token)
        ->post("/api/expenses/{$expense->id}/document", [
            'document' => $file,
        ], [
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ]);

    $response->assertStatus(200);

    $expense->refresh();
    expect($expense->document_path)->not->toBeNull();
    Storage::disk('public')->assertExists($expense->document_path);
});

test('puede actualizar número y documento al mismo tiempo', function () {
    Storage::fake('public');

    $expense = Expense::factory()->create([
        'document_number' => null,
        'document_path' => null,
    ]);

    $file = UploadedFile::fake()->image('factura.jpg');

    $response = $this->withToken($this->token)
        ->post("/api/expenses/{$expense->id}/document", [
            'document_number' => 'DOC-2025-100',
            'document' => $file,
        ], [
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ]);

    $response->assertStatus(200);

    $expense->refresh();
    expect($expense->document_number)->toBe('DOC-2025-100');
    expect($expense->document_path)->not->toBeNull();
    Storage::disk('public')->assertExists($expense->document_path);
});

test('elimina imagen anterior al subir nueva', function () {
    Storage::fake('public');

    $oldFile = UploadedFile::fake()->image('old.jpg');
    $oldPath = $oldFile->store('expense-documents', 'public');

    $expense = Expense::factory()->create([
        'document_path' => $oldPath,
    ]);

    Storage::disk('public')->assertExists($oldPath);

    $newFile = UploadedFile::fake()->image('new.jpg');

    $response = $this->withToken($this->token)
        ->post("/api/expenses/{$expense->id}/document", [
            'document' => $newFile,
        ], [
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ]);

    $response->assertStatus(200);

    Storage::disk('public')->assertMissing($oldPath);
    $expense->refresh();
    Storage::disk('public')->assertExists($expense->document_path);
});

test('puede eliminar imagen del documento', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('factura.jpg');
    $path = $file->store('expense-documents', 'public');

    $expense = Expense::factory()->create([
        'document_path' => $path,
    ]);

    Storage::disk('public')->assertExists($path);

    $response = $this->withToken($this->token)
        ->postJson("/api/expenses/{$expense->id}/document", [
            'delete_document' => true,
        ]);

    $response->assertStatus(200);

    $expense->refresh();
    expect($expense->document_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('valida el formato del documento', function () {
    Storage::fake('public');

    $expense = Expense::factory()->create();

    $file = UploadedFile::fake()->create('documento.txt', 100);

    $response = $this->withToken($this->token)
        ->post("/api/expenses/{$expense->id}/document", [
            'document' => $file,
        ], [
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['document']);
});

test('valida el tamaño máximo del documento', function () {
    Storage::fake('public');

    $expense = Expense::factory()->create();

    // Archivo de 3MB (excede el límite de 2MB)
    $file = UploadedFile::fake()->create('factura.pdf', 3072);

    $response = $this->withToken($this->token)
        ->post("/api/expenses/{$expense->id}/document", [
            'document' => $file,
        ], [
            'Authorization' => "Bearer {$this->token}",
            'Accept' => 'application/json',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['document']);
});

test('puede obtener estadísticas de gastos', function () {
    Expense::factory()->count(10)->create();

    $response = $this->withToken($this->token)
        ->getJson('/api/expenses/statistics');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'total_expenses',
            'total_amount',
            'this_month_expenses',
        ]);
});

test('responde 404 para gasto inexistente', function () {
    $response = $this->withToken($this->token)
        ->getJson('/api/expenses/99999');

    $response->assertStatus(404);
});

test('la paginación funciona correctamente', function () {
    Expense::factory()->count(25)->create();

    $response = $this->withToken($this->token)
        ->getJson('/api/expenses?per_page=10&page=1');

    $response->assertStatus(200);

    $data = $response->json();
    expect($data['per_page'])->toBe(10);
    expect($data['current_page'])->toBe(1);
    expect(count($data['data']))->toBeLessThanOrEqual(10);
});
