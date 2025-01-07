<?php

namespace App\Http\Requests;

use App\Models\SalePriceList;
use Illuminate\Foundation\Http\FormRequest;

class ToggleSalePriceListRequest extends FormRequest
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
            $salePriceList = 
                SalePriceList::exists(
                    auth()->user()->IDcompany, 
                    $this->salePriceList->toArray(), 
                    $this->salePriceList->id
                )
                ->first();

            if($salePriceList){
                abort(400, "You cannot enable this sales price list because there is already one active");
            }
        }
       
    }
}
