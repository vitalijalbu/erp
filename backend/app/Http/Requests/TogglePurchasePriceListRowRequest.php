<?php

namespace App\Http\Requests;

use App\Models\PurchasePriceListRow;
use Illuminate\Foundation\Http\FormRequest;

class TogglePurchasePriceListRowRequest extends FormRequest
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
                PurchasePriceListRow::checkOverlappingDates(
                    auth()->user()->IDcompany, 
                    $this->purchasePriceListRow->toArray(), 
                    $this->purchasePriceListRow->id
                );

            if($response){
                abort(400, "You cannot enable this purchase price list row because there are problems with the dates");
            }else{
                $purchasePriceListRow = 
                    PurchasePriceListRow::exists(
                        auth()->user()->IDcompany, 
                        $this->purchasePriceListRow->toArray(), 
                        $this->purchasePriceListRow->id
                    )->first();

                if($purchasePriceListRow){
                    abort(400, "You cannot enable this purchase price list row because there is already one active");
                }
            }
        }
    }
}
