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
            'discount' => ['nullable', 'numeric', 'min:0', 'decimal:0,2'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.id' => ['nullable', 'integer', 'exists:expense_details,id'],
            'details.*.name' => ['required_if:details.*._destroy,false', 'string', 'max:150'],
            'details.*.amount' => ['required_if:details.*._destroy,false', 'numeric', 'min:0', 'decimal:0,2'],
            'details.*.quantity' => ['required_if:details.*._destroy,false', 'numeric', 'integer', 'min:1'],
            'details.*.observation' => ['nullable', 'string', 'max:255'],
            'details.*.category_id' => ['required_if:details.*._destroy,false', 'exists:categories,id'],
            'details.*._destroy' => ['nullable', 'boolean'],
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
            'discount.numeric' => 'El campo "Descuento" debe ser un número.',
            'discount.min' => 'El campo "Descuento" debe ser mayor o igual a 0.',
            'discount.decimal' => 'El campo "Descuento" debe tener máximo 2 decimales.',
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
            'discount' => $this->has('discount') && $this->discount === '' ? null : ($this->discount ?? null),
            // Convert delete_document from string '1'/'0' or boolean to boolean
            // FormData sends it as string '1', so we need to handle both cases
            'delete_document' => $this->has('delete_document')
                ? ($this->input('delete_document') === '1' || $this->input('delete_document') === true || $this->input('delete_document') === 'true')
                : false,
        ]);

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

            $discount = floatval($this->input('discount', 0));

            // Validate that discount is not greater than subtotal
            if ($discount > $subtotal) {
                $validator->errors()->add(
                    'discount',
                    'El descuento no puede ser mayor que el subtotal del gasto ('.number_format($subtotal, 2).').'
                );
            }
        });
    }
}
