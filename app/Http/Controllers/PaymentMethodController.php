<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $perPage = request('per_page', 10);
        $paymentMethods = PaymentMethod::latest()->paginate($perPage);

        return Inertia::render('payment-methods/index', [
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PaymentMethodRequest $request): RedirectResponse
    {
        PaymentMethod::create($request->validated());

        return to_route('payment-methods.index')->with('success', 'Método de pago creado exitosamente');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->update($request->validated());

        return to_route('payment-methods.index')->with('success', 'Método de pago actualizado exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->delete();

        return to_route('payment-methods.index')->with('success', 'Método de pago eliminado exitosamente');
    }
}

