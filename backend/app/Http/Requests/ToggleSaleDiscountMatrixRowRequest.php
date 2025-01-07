<?php

namespace App\Http\Requests;

use App\Models\SaleDiscountMatrixRow;
use Illuminate\Foundation\Http\FormRequest;

class ToggleSaleDiscountMatrixRowRequest extends FormRequest
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
            $response = 
                SaleDiscountMatrixRow::checkOverlappingDates(
                    auth()->user()->IDcompany, 
                    $this->saleDiscountMatrixRow->toArray(), 
                    $this->saleDiscountMatrixRow->id
                );

            if($response){
                abort(400, "You cannot enable this sales discount matrix row because there are problems with the dates");
            }else{
                $saleDiscountMatrixRow = 
                    SaleDiscountMatrixRow::exists(
                        auth()->user()->IDcompany, 
                        $this->saleDiscountMatrixRow->toArray(), 
                        $this->saleDiscountMatrixRow->id
                    )->first();

                if($saleDiscountMatrixRow){
                    abort(400, "You cannot enable this sales discount matrix row because there is already one active");
                }
            }
        }
    }
}
