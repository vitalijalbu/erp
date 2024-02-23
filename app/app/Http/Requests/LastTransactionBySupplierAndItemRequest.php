<?php

namespace App\Http\Requests;

use App\Models\Item;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class LastTransactionBySupplierAndItemRequest extends FormRequest
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
            'idItem' => ['required', 'exists:'.Item::class.',IDitem'],
            'idBP' => ['required', Rule::exists('bp', 'IDbp')->where(function ($query) {
                $query->where('supplier', 1)->where('IDcompany', auth()->user()->IDcompany);
            })]
        ];
    }
}
