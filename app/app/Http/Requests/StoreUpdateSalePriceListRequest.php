<?php

namespace App\Http\Requests;

use App\Models\SalePriceList;
use App\Rules\AlphaUnderscore;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateSalePriceListRequest extends FormRequest
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
            'code' => ['required', 'string', new AlphaUnderscore, Rule::unique('sales_price_lists', 'code')->where('company_id', auth()->user()->IDcompany)->ignore($this->salePriceList)],
            'currency_id' => ['required', 'string', Rule::exists('currencies', 'id')],
            'bp_id' => [
                'sometimes', 'string', 'nullable', 
                Rule::exists('bp', 'IDbp')->where('IDcompany', auth()->user()->IDcompany)->where('customer', 1)
            ],
        ];
    }

    protected function passedValidation()
    {
        $salePriceList = SalePriceList::exists(auth()->user()->IDcompany, $this->validated())->first();

        if($salePriceList){
            abort(400, "You cannot add a new sales price list because there is already one active");
        }
    }
}
