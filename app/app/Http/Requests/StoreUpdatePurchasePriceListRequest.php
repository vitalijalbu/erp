<?php

namespace App\Http\Requests;

use App\Rules\AlphaUnderscore;
use Illuminate\Validation\Rule;
use App\Models\PurchasePriceList;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdatePurchasePriceListRequest extends FormRequest
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
            'code' => ['required', 'string', new AlphaUnderscore, Rule::unique('purchase_price_lists', 'code')->where('company_id', auth()->user()->IDcompany)->ignore($this->purchasePriceList)],
            'currency_id' => ['required', 'string', Rule::exists('currencies', 'id')],
            'bp_id' => [
                'sometimes', 'string', 'nullable', 
                Rule::exists('bp', 'IDbp')->where('IDcompany', auth()->user()->IDcompany)->where('supplier', 1)
            ],
        ];
    }

    protected function passedValidation()
    {
        $purchasePriceList = PurchasePriceList::exists(auth()->user()->IDcompany, $this->validated())->first();

        if($purchasePriceList){
            abort(400, "You cannot add a new purchase price list because there is already one active");
        }
    }
}
