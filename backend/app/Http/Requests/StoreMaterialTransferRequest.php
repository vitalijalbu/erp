<?php

namespace App\Http\Requests;

use App\Models\Stock;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialTransferRequest extends FormRequest
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
        $user = auth()->user();

        return [
            'idStocks' => ['required', 'array'],
            'idStocks.*' => ['required', Rule::exists('stock', 'IDstock')->where(function ($query) use ($user) {
                $query->where('IDcompany', $user->IDcompany);
            })]
        ];
    }
}
