<?php

namespace App\Http\Requests;

use App\Models\SaleTotalDiscountMatrixRow;
use Illuminate\Foundation\Http\FormRequest;

class ToggleSaleTotalDiscountMatrixRowRequest extends FormRequest
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
            
            $saleTotalDiscountMatrixRow = 
                SaleTotalDiscountMatrixRow::exists(
                    auth()->user()->IDcompany, 
                    $this->saleTotalDiscountMatrixRow->toArray(), 
                    $this->saleTotalDiscountMatrixRow->id
                )->first();

            if($saleTotalDiscountMatrixRow){
                abort(400, "You cannot enable this sales total discount matrix row because there is already one active");
            }
            
        }
    }
}
