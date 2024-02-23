<?php

namespace App\Http\Requests;

use App\Models\SalePriceListRow;
use Illuminate\Foundation\Http\FormRequest;

class ToggleSalePriceListRowRequest extends FormRequest
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
                SalePriceListRow::checkOverlappingDates(
                    auth()->user()->IDcompany, 
                    $this->salePriceListRow->toArray(), 
                    $this->salePriceListRow->id
                );

            if($response){
                abort(400, "You cannot enable this sales price list row because there are problems with the dates");
            }else{
                $salePriceListRow = 
                    SalePriceListRow::exists(
                        auth()->user()->IDcompany, 
                        $this->salePriceListRow->toArray(),
                        $this->salePriceListRow->id
                    )->first();

                if($salePriceListRow){
                    abort(400, "You cannot enable this sales price list row because there is already one active");
                }
            }
        }
    }
}
