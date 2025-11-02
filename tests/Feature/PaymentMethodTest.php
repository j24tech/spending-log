<?php

use App\Models\PaymentMethod;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('puede listar los métodos de pago cuando está autenticado', function () {
    PaymentMethod::factory()->count(3)->create();

    $response = $this->actingAs($this->user)->get('/payment-methods');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('payment-methods/index')
        ->has('paymentMethods.data', 3)
    );
});

test('no puede listar los métodos de pago cuando no está autenticado', function () {
    $response = $this->get('/payment-methods');

    $response->assertRedirect('/login');
});

test('puede ver el formulario de creación de método de pago', function () {
    $response = $this->actingAs($this->user)->get('/payment-methods/create');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('payment-methods/create')
    );
});

test('puede crear un método de pago con datos válidos', function () {
    $paymentMethodData = [
        'name' => 'Tarjeta de Crédito',
    ];

    $response = $this->actingAs($this->user)->post('/payment-methods', $paymentMethodData);

    $response->assertRedirect('/payment-methods');

    $this->assertDatabaseHas('payment_methods', [
        'name' => 'Tarjeta de Crédito',
    ]);
});

test('no puede crear un método de pago sin nombre', function () {
    $response = $this->actingAs($this->user)->post('/payment-methods', []);

    $response->assertSessionHasErrors(['name']);
});

test('puede ver el formulario de edición de método de pago', function () {
    $paymentMethod = PaymentMethod::factory()->create();

    $response = $this->actingAs($this->user)->get("/payment-methods/{$paymentMethod->id}/edit");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('payment-methods/edit')
        ->has('paymentMethod')
    );
});

test('puede actualizar un método de pago con datos válidos', function () {
    $paymentMethod = PaymentMethod::factory()->create(['name' => 'Efectivo']);

    $updateData = [
        'name' => 'Efectivo Actualizado',
    ];

    $response = $this->actingAs($this->user)->put("/payment-methods/{$paymentMethod->id}", $updateData);

    $response->assertRedirect('/payment-methods');

    $this->assertDatabaseHas('payment_methods', [
        'id' => $paymentMethod->id,
        'name' => 'Efectivo Actualizado',
    ]);
});

test('puede eliminar un método de pago', function () {
    $paymentMethod = PaymentMethod::factory()->create();

    $response = $this->actingAs($this->user)->delete("/payment-methods/{$paymentMethod->id}");

    $response->assertRedirect('/payment-methods');

    $this->assertDatabaseMissing('payment_methods', [
        'id' => $paymentMethod->id,
    ]);
});
