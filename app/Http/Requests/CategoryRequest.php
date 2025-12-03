<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:100'],
            'observation' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
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

        // Convert is_active to boolean if present
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN),
            ]);
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
            'name.required' => 'El nombre de la categoría es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 100 caracteres.',
            'observation.max' => 'La observación no puede tener más de 255 caracteres.',
            'tags.array' => 'Las etiquetas deben ser un arreglo válido.',
            'tags.*.string' => 'Cada etiqueta debe ser texto.',
            'tags.*.max' => 'Cada etiqueta no puede tener más de 50 caracteres.',
        ];
    }
}
