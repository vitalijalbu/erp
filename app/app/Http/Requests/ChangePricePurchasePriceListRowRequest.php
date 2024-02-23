<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class ChangePricePurchasePriceListRowRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'price_change' => ['required_without_all:rows', 'numeric', 'nullable', 'min:-100'],
            'rows' => ['sometimes', 'array', 'nullable'],
            'rows.*.item_group_id' => [
                'nullable', 
                function($attribute, $value, $fail) {
                    $index = explode('.', $attribute)[1];

                    if (request()->rows[$index]['item_subfamily_id']){
                        return $fail("The :attribute field must be missing when item_subfamily_id is present.");
                    }
                },
                'required_without_all:rows.*.item_subfamily_id',
                'string', 
                'distinct',
                Rule::exists('item_group', 'id')->whereIn('IDcompany', [0, auth()->user()->IDcompany]),
            ],
            'rows.*.item_subfamily_id' => [
                'nullable', 
                'required_without_all:rows.*.item_group_id',
                function($attribute, $value, $fail) {
                    $index = explode('.', $attribute)[1];

                    if (request()->rows[$index]['item_group_id']){
                        return $fail("The :attribute field must be missing when item_group_id is present.");
                    }
                },
                'string', 
                'distinct',
                Rule::exists('items_subfamilies', 'id')->whereIn('company_id', [0, auth()->user()->IDcompany])
            ],
            'rows.*.price_change' => [
                'required',
                'numeric',
                'min:-100'
            ],
        ];
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
