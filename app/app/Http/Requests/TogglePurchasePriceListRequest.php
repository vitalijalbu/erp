<?php

namespace App\Http\Requests;

use App\Models\PurchasePriceList;
use Illuminate\Foundation\Http\FormRequest;

class TogglePurchasePriceListRequest extends FormRequest
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
            $purchasePriceList = 
                PurchasePriceList::exists(
                    auth()->user()->IDcompany, 
                    $this->purchasePriceList->toArray(), 
                    $this->purchasePriceList->id
                )
                ->first();

            if($purchasePriceList){
                abort(400, "You cannot enable this purchase price list because there is already one active");
            }
        }
       
    }
}
