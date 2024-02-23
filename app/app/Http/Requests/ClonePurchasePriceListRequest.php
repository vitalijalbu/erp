<?php

namespace App\Http\Requests;

use App\Rules\AlphaUnderscore;
use Illuminate\Validation\Rule;
use App\Models\PurchasePriceList;
use Illuminate\Foundation\Http\FormRequest;

class ClonePurchasePriceListRequest extends FormRequest
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
            'code' => ['required', 'string', new AlphaUnderscore, Rule::unique('purchase_price_lists', 'code')->where('company_id', auth()->user()->IDcompany)],
            'currency_id' => ['required', 'string', Rule::exists('currencies', 'id')],
            'price_change' => ['sometimes', 'numeric', 'nullable', 'min:-100'],
            'rows' => ['sometimes', 'array', 'nullable'],
            'rows.*.item_group_id' => [
                function($attribute, $value, $fail) {
                    $index = explode('.', $attribute)[1];

                    if (request()->rows[$index]['item_subfamily_id']){
                        return $fail("The :attribute field must be missing when item_subfamily_id is present.");
                    }
                },
                'required_without_all:rows.*.item_subfamily_id',
                'string', 
                'nullable', 
                'distinct',
                Rule::exists('item_group', 'id')->whereIn('IDcompany', [0, auth()->user()->IDcompany]),
            ],
            'rows.*.item_subfamily_id' => [
                'required_without_all:rows.*.item_group_id',
                function($attribute, $value, $fail) {
                    $index = explode('.', $attribute)[1];

                    if (request()->rows[$index]['item_group_id']){
                        return $fail("The :attribute field must be missing when item_group_id is present.");
                    }
                },
                'string', 
                'nullable', 
                'distinct',
                Rule::exists('items_subfamilies', 'id')->whereIn('company_id', [0, auth()->user()->IDcompany])
            ],
            'rows.*.price_change' => [
                'required',
                'numeric',
                'min:-100'
            ],
            'bp_id' => [
                'sometimes', 'string', 'nullable', 
                Rule::exists('bp', 'IDbp')->where('IDcompany', auth()->user()->IDcompany)->where('customer', 1)
            ],
            'rate' => [
                Rule::requiredIf(function(){
                    return $this->purchasePriceList->currency_id != $this->currency_id;
                }),
                Rule::prohibitedIf(function(){
                    return $this->purchasePriceList->currency_id == $this->currency_id;
                }),
                'numeric',
                'gt:0',
                'nullable'
            ]
        ];
    }

    protected function passedValidation()
    {
        $purchasePriceList = PurchasePriceList::exists(auth()->user()->IDcompany, $this->validated())->first();

        if($purchasePriceList){
            abort(400, "You cannot clone this purchase price list because there is already one active");
        }
    }

    public function attributes()
    {
        return [
            'rows.*.item_group_id' => 'item group id',
            'rows.*.item_subfamily_id' => 'item subfamily id',
            'rows.*.price_change' => 'price change',
        ];
    }
}
