<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportGraphStockAtDateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'dateFrom' => ['required', 'date'],
            'dateTo' => ['required', 'date'],
            'idItem' => ['required', 'exists:App\Models\Item,IDitem']
        ];
    }
}
