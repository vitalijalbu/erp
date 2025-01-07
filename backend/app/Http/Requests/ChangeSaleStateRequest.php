<?php

namespace App\Http\Requests;

use App\Enum\SaleState;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class ChangeSaleStateRequest extends FormRequest
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
            'state' => ['required', 'string', Rule::in([SaleState::approved->value, SaleState::canceled->value, SaleState::closed->value])],
        ];
    }
}
