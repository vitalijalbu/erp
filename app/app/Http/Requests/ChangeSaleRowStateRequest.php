<?php

namespace App\Http\Requests;

use App\Enum\SaleRowState;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class ChangeSaleRowStateRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return  [
            'state' => ['required', 'string', Rule::in([SaleRowState::canceled->value, SaleRowState::closed->value])],
        ];
    }
}
