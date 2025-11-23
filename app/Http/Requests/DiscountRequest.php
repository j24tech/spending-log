<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DiscountRequest extends FormRequest
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
            'observation' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert empty strings to null for nullable fields
        $this->merge([
            'observation' => $this->has('observation') && $this->observation === '' ? null : ($this->observation ?? null),
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
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del descuento es obligatorio.',
            'name.string' => 'El nombre del descuento debe ser texto.',
            'name.max' => 'El nombre no puede tener más de 150 caracteres.',
            'observation.string' => 'La observación debe ser texto.',
            'observation.max' => 'La observación no puede tener más de 255 caracteres.',
            'tags.array' => 'Las etiquetas deben ser un arreglo válido.',
            'tags.*.string' => 'Cada etiqueta debe ser texto.',
            'tags.*.max' => 'Cada etiqueta no puede tener más de 50 caracteres.',
        ];
    }
}


