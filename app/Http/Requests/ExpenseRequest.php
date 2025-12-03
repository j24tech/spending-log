<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'expense_date' => ['required', 'date'],
            'observation' => ['nullable', 'string', 'max:255'],
            'document_number' => ['nullable', 'string', 'max:50'],
            'document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'], // 5MB max
            'delete_document' => ['nullable', 'boolean'],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.id' => ['nullable', 'integer', 'exists:expense_details,id'],
            'details.*.name' => ['required_if:details.*._destroy,false', 'string', 'max:150'],
            'details.*.amount' => ['required_if:details.*._destroy,false', 'numeric', 'min:0', 'decimal:0,2'],
            'details.*.quantity' => ['required_if:details.*._destroy,false', 'numeric', 'integer', 'min:1'],
            'details.*.observation' => ['nullable', 'string', 'max:255'],
            'details.*.category_id' => ['required_if:details.*._destroy,false', 'exists:categories,id'],
            'details.*._destroy' => ['nullable', 'boolean'],
            'expense_discounts' => ['nullable', 'array'],
            'expense_discounts.*.id' => ['nullable', 'integer', 'exists:expense_discounts,id'],
            'expense_discounts.*.discount_id' => ['required_if:expense_discounts.*._destroy,false', 'exists:discounts,id'],
            'expense_discounts.*.observation' => ['nullable', 'string', 'max:255'],
            'expense_discounts.*.discount_amount' => ['required_if:expense_discounts.*._destroy,false', 'numeric', 'min:0.01', 'decimal:0,2'],
            'expense_discounts.*.date' => ['required_if:expense_discounts.*._destroy,false', 'date'],
            'expense_discounts.*._destroy' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get the validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El campo "Nombre del Gasto" es obligatorio.',
            'name.string' => 'El campo "Nombre del Gasto" debe ser texto.',
            'name.max' => 'El campo "Nombre del Gasto" no puede tener más de 150 caracteres.',
            'expense_date.required' => 'El campo "Fecha" es obligatorio.',
            'expense_date.date' => 'El campo "Fecha" debe ser una fecha válida.',
            'payment_method_id.required' => 'El campo "Método de Pago" es obligatorio.',
            'payment_method_id.exists' => 'El método de pago seleccionado no existe.',
            'details.required' => 'Debe agregar al menos un detalle del gasto.',
            'details.array' => 'Los detalles del gasto deben ser un array.',
            'details.min' => 'Debe agregar al menos un detalle del gasto.',
            'details.*.name.required_if' => 'La descripción del detalle es obligatoria.',
            'details.*.name.string' => 'La descripción del detalle debe ser texto.',
            'details.*.name.max' => 'La descripción del detalle no puede tener más de 150 caracteres.',
            'details.*.amount.required_if' => 'El precio unitario del detalle es obligatorio.',
            'details.*.amount.numeric' => 'El precio unitario debe ser un número.',
            'details.*.amount.min' => 'El precio unitario debe ser mayor o igual a 0.',
            'details.*.amount.decimal' => 'El precio unitario debe tener máximo 2 decimales.',
            'details.*.quantity.required_if' => 'La cantidad del detalle es obligatoria.',
            'details.*.quantity.integer' => 'La cantidad debe ser un número entero.',
            'details.*.quantity.min' => 'La cantidad debe ser mayor o igual a 1.',
            'details.*.category_id.required_if' => 'La categoría del detalle es obligatoria.',
            'details.*.category_id.exists' => 'La categoría seleccionada no existe.',
            'document.file' => 'El documento debe ser un archivo.',
            'document.mimes' => 'El documento debe ser PDF, JPG, JPEG o PNG.',
            'document.max' => 'El documento no puede ser mayor a 5MB.',
            'observation.string' => 'La observación debe ser texto.',
            'observation.max' => 'La observación no puede tener más de 255 caracteres.',
            'document_number.string' => 'El número de documento debe ser texto.',
            'document_number.max' => 'El número de documento no puede tener más de 50 caracteres.',
            'expense_discounts.*.discount_id.required_if' => 'El tipo de descuento es obligatorio.',
            'expense_discounts.*.discount_id.exists' => 'El tipo de descuento seleccionado no existe.',
            'expense_discounts.*.discount_amount.required_if' => 'El monto del descuento es obligatorio.',
            'expense_discounts.*.discount_amount.numeric' => 'El monto del descuento debe ser un número.',
            'expense_discounts.*.discount_amount.min' => 'El monto del descuento debe ser mayor a cero.',
            'expense_discounts.*.discount_amount.decimal' => 'El monto del descuento debe tener máximo 2 decimales.',
            'expense_discounts.*.date.required_if' => 'La fecha del descuento es obligatoria.',
            'expense_discounts.*.date.date' => 'La fecha del descuento debe ser una fecha válida.',
            'expense_discounts.*.observation.string' => 'La observación del descuento debe ser texto.',
            'expense_discounts.*.observation.max' => 'La observación del descuento no puede tener más de 255 caracteres.',
            'tags.array' => 'Las etiquetas deben ser un arreglo válido.',
            'tags.*.string' => 'Cada etiqueta debe ser texto.',
            'tags.*.max' => 'Cada etiqueta no puede tener más de 50 caracteres.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Log for debugging when data seems incomplete (only in development)
        if (config('app.debug')) {
            \Log::debug('ExpenseRequest - Received data', [
                'method' => $this->method(),
                'has_name' => $this->has('name'),
                'has_expense_date' => $this->has('expense_date'),
                'has_payment_method_id' => $this->has('payment_method_id'),
                'has_document' => $this->hasFile('document'),
                'has_delete_document' => $this->has('delete_document'),
                'delete_document_value' => $this->input('delete_document'),
                'all_input_keys' => array_keys($this->all()),
                'all_files' => array_keys($this->allFiles()),
                'all_input_sample' => array_slice($this->all(), 0, 5), // Sample first 5 keys
            ]);
        }

        // Convert empty strings to null for nullable fields ONLY
        // Don't touch required fields - they should be sent as-is
        $this->merge([
            'observation' => $this->has('observation') && $this->observation === '' ? null : ($this->observation ?? null),
            'document_number' => $this->has('document_number') && $this->document_number === '' ? null : ($this->document_number ?? null),
            // Convert delete_document from string '1'/'0' or boolean to boolean
            // FormData sends it as string '1', so we need to handle both cases
            'delete_document' => $this->has('delete_document')
                ? ($this->input('delete_document') === '1' || $this->input('delete_document') === true || $this->input('delete_document') === 'true')
                : false,
        ]);

        // Convert tags string to array for validation and storage
        // Input: "chile, jesus, deuda" -> Output: ["chile", "jesus", "deuda"]
        if ($this->has('tags')) {
            if (is_string($this->tags)) {
                $tagsArray = array_filter(
                    array_map('trim', explode(',', $this->tags)),
                    fn ($tag) => ! empty($tag)
                );

                $this->merge([
                    'tags' => ! empty($tagsArray) ? $tagsArray : null,
                ]);
            } elseif (empty($this->tags)) {
                $this->merge([
                    'tags' => null,
                ]);
            }
        }

        // Ensure at least one detail is not marked for deletion
        $details = $this->input('details', []);

        // Convert quantity to integer for each detail
        $processedDetails = [];
        foreach ($details as $index => $detail) {
            $processedDetail = $detail;
            // Convert quantity from string to integer if present
            if (isset($detail['quantity']) && $detail['quantity'] !== '') {
                $processedDetail['quantity'] = (int) $detail['quantity'];
            }
            $processedDetails[] = $processedDetail;
        }

        if (! empty($processedDetails)) {
            $this->merge(['details' => $processedDetails]);
        }

        $activeDetails = array_filter($processedDetails, function ($detail) {
            return empty($detail['_destroy']) || $detail['_destroy'] === false || $detail['_destroy'] === 'false';
        });

        if (count($activeDetails) === 0) {
            $this->merge([
                'details' => [], // This will fail validation
            ]);
        }

        // Process expense discounts
        $expenseDiscounts = $this->input('expense_discounts', []);
        $processedDiscounts = [];
        foreach ($expenseDiscounts as $index => $discount) {
            $processedDiscount = $discount;
            // Convert discount_amount from string to float if present
            if (isset($discount['discount_amount']) && $discount['discount_amount'] !== '') {
                $processedDiscount['discount_amount'] = (float) $discount['discount_amount'];
            }
            // Convert discount_id to integer if present
            if (isset($discount['discount_id']) && $discount['discount_id'] !== '') {
                $processedDiscount['discount_id'] = (int) $discount['discount_id'];
            }
            // Set default date to current date if not provided
            if (! isset($discount['date']) || $discount['date'] === '') {
                $processedDiscount['date'] = now()->format('Y-m-d');
            }
            // Convert observation empty string to null
            if (isset($discount['observation']) && $discount['observation'] === '') {
                $processedDiscount['observation'] = null;
            }
            $processedDiscounts[] = $processedDiscount;
        }

        if (! empty($processedDiscounts)) {
            $this->merge(['expense_discounts' => $processedDiscounts]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Calculate subtotal from active details
            $details = $this->input('details', []);
            $subtotal = 0;

            foreach ($details as $detail) {
                // Skip details marked for deletion
                if (isset($detail['_destroy']) && $detail['_destroy']) {
                    continue;
                }

                $amount = floatval($detail['amount'] ?? 0);
                $quantity = floatval($detail['quantity'] ?? 0);
                $subtotal += $amount * $quantity;
            }

            // Calculate total discounts (only applied discounts)
            $expenseDiscounts = $this->input('expense_discounts', []);
            $totalAppliedDiscounts = 0;

            foreach ($expenseDiscounts as $index => $expenseDiscount) {
                // Skip discounts marked for deletion
                if (isset($expenseDiscount['_destroy']) && $expenseDiscount['_destroy']) {
                    continue;
                }

                $discountAmount = floatval($expenseDiscount['discount_amount'] ?? 0);

                // Validate that discount amount is greater than zero
                if ($discountAmount <= 0) {
                    $validator->errors()->add(
                        "expense_discounts.{$index}.discount_amount",
                        'El monto del descuento debe ser mayor a cero.'
                    );
                }

                // Validate that each individual discount is not greater than subtotal
                if ($discountAmount > $subtotal) {
                    $validator->errors()->add(
                        "expense_discounts.{$index}.discount_amount",
                        'El monto del descuento ('.number_format($discountAmount, 2).') no puede ser mayor que el subtotal del gasto ('.number_format($subtotal, 2).').'
                    );
                }

                $totalAppliedDiscounts += $discountAmount;
            }

            // Validate that total discounts are not greater than subtotal
            if ($totalAppliedDiscounts > $subtotal) {
                $validator->errors()->add(
                    'expense_discounts',
                    'La suma de todos los descuentos no puede ser mayor que el subtotal del gasto ('.number_format($subtotal, 2).').'
                );
            }
        });
    }
}
