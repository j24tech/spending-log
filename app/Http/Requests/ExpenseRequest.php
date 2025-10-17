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
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.id' => ['nullable', 'integer', 'exists:expense_details,id'],
            'details.*.name' => ['required_if:details.*._destroy,false', 'string', 'max:150'],
            'details.*.amount' => ['required_if:details.*._destroy,false', 'numeric', 'min:0', 'decimal:0,2'],
            'details.*.quantity' => ['required_if:details.*._destroy,false', 'integer', 'min:1'],
            'details.*.observation' => ['nullable', 'string', 'max:255'],
            'details.*.category_id' => ['required_if:details.*._destroy,false', 'exists:categories,id'],
            'details.*._destroy' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Ensure at least one detail is not marked for deletion
        $details = $this->input('details', []);
        $activeDetails = array_filter($details, function ($detail) {
            return empty($detail['_destroy']) || $detail['_destroy'] === false || $detail['_destroy'] === 'false';
        });

        if (count($activeDetails) === 0) {
            $this->merge([
                'details' => [] // This will fail validation
            ]);
        }
    }
}

