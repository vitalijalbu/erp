<?php

namespace App\Http\Requests;

use App\Models\SaleTotalDiscountMatrix;
use Illuminate\Foundation\Http\FormRequest;

class ToggleSaleTotalDiscountMatrixRequest extends FormRequest
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
            'disable' => ['required', 'boolean']
        ];
    }

    protected function passedValidation()
    {
        if(!$this->disable){
            $saleTotalDiscountMatrix = 
                SaleTotalDiscountMatrix::exists(
                    auth()->user()->IDcompany, 
                    $this->saleTotalDiscountMatrix->toArray(), 
                    $this->saleTotalDiscountMatrix->id
                )
                ->first();

            if($saleTotalDiscountMatrix){
                abort(400, "You cannot enable this sales total discount matrix because there is already one active");
            }
        }
    }
}
