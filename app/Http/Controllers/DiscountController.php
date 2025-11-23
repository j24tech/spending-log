<?php

namespace App\Http\Controllers;

use App\Http\Requests\DiscountRequest;
use App\Models\Discount;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DiscountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $perPage = request('per_page', 10);
        $discounts = Discount::latest()->paginate($perPage);

        return Inertia::render('discounts/index', [
            'discounts' => $discounts,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('discounts/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DiscountRequest $request): RedirectResponse
    {
        Discount::create($request->validated());

        return to_route('discounts.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Discount $discount): Response
    {
        return Inertia::render('discounts/edit', [
            'discount' => $discount,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DiscountRequest $request, Discount $discount): RedirectResponse
    {
        $discount->update($request->validated());

        return to_route('discounts.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Discount $discount): RedirectResponse
    {
        // Check if discount is being used
        if ($discount->expenseDiscounts()->count() > 0) {
            return back()->withErrors([
                'discount' => 'No se puede eliminar este descuento porque está siendo utilizado en uno o más gastos.',
            ]);
        }

        $discount->delete();

        return to_route('discounts.index');
    }
}


