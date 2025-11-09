<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Sanctum middleware maneja la autenticación
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'document_number' => 'nullable|string|max:50',
            'document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'delete_document' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'document_number.max' => 'El número de documento no puede exceder 50 caracteres.',
            'document.file' => 'El documento debe ser un archivo.',
            'document.mimes' => 'El documento debe ser un archivo de tipo: jpg, jpeg, png, pdf.',
            'document.max' => 'El documento no puede ser mayor a 2MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convertir delete_document a boolean si viene como string
        if ($this->has('delete_document')) {
            $this->merge([
                'delete_document' => filter_var($this->delete_document, FILTER_VALIDATE_BOOLEAN),
            ]);
        }

        // Convertir document_number vacío a null
        if ($this->has('document_number') && $this->document_number === '') {
            $this->merge([
                'document_number' => null,
            ]);
        }
    }
}
