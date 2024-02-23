<?php

namespace App\Http\Requests;

use App\Models\SaleDiscountMatrix;
use Illuminate\Foundation\Http\FormRequest;

class ToggleSaleDiscountMatrixRequest extends FormRequest
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
            $saleDiscountMatrix = 
                SaleDiscountMatrix::exists(
                    auth()->user()->IDcompany, 
                    $this->saleDiscountMatrix->toArray(), 
                    $this->saleDiscountMatrix->id
                )
                ->first();

            if($saleDiscountMatrix){
                abort(400, "You cannot enable this sales discount matrix because there is already one active");
            }
        }
    }
}
