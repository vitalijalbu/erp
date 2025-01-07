<?php

namespace App\Http\Requests;

use App\Models\SalePriceList;
use App\Rules\AlphaUnderscore;
use Illuminate\Validation\Rule;
use App\Models\SaleDiscountMatrix;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateSaleDiscountMatrixRequest extends FormRequest
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
            'priority' => ['required', 'integer'],
            'description' => ['required', 'string'],
            'currency_id' => ['sometimes', 'string', Rule::exists('currencies', 'id')],
            'sales_price_list_id' => [
                'sometimes', 'string', 'nullable', 
                Rule::exists('sales_price_lists', 'id')->where('company_id', auth()->user()->IDcompany)
            ],
            'bp_id' => [
                'sometimes', 'string', 'nullable', 
                Rule::exists('bp', 'IDbp')->where('IDcompany', auth()->user()->IDcompany)->where('customer', 1)
            ],
        ];
    }

    protected function passedValidation()
    {
        $saleDiscountMatrix = SaleDiscountMatrix::exists(auth()->user()->IDcompany, $this->validated())->first();

        if($saleDiscountMatrix){
            abort(400, "You cannot add a new sales discount matrix because there is already one active");
        }
    }
}
