<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use App\Models\SaleTotalDiscountMatrix;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateSaleTotalDiscountMatrixRequest extends FormRequest
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
        return [
            'priority' => ['required', 'integer'],
            'description' => ['required', 'string'],
            'currency_id' => ['sometimes', 'nullable', 'string', Rule::exists('currencies', 'id')],
        ];
    }

    protected function passedValidation()
    {
        $saleTotalDiscountMatrix = SaleTotalDiscountMatrix::exists(auth()->user()->IDcompany, $this->validated())->first();

        if($saleTotalDiscountMatrix){
            abort(400, "You cannot add a new sales total discount matrix because there is already one active");
        }
    }
}
