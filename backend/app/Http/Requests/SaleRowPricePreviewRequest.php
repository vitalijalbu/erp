<?php

namespace App\Http\Requests;

use App\Models\BP;
use App\Models\Item;
use App\Enum\ItemType;
use App\Enum\SaleType;
use App\Enum\SaleState;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Foundation\Http\FormRequest;

class SaleRowPricePreviewRequest extends FormRequest
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
        return  [
            'sale_type' => ['required', 'string', new Enum(SaleType::class)],
            'bp_id' => ['required', 'string', 
                Rule::exists('bp', 'IDbp')->where('IDcompany', auth()->user()->IDcompany),
                function($attribute, $value, $fail){
                    $bp = BP::where('IDbp', $this->bp_id)->first();

                    if($bp->is_blocked){
                        $fail("The selected business partner is blocked");
                    }else if(!$bp->is_active){
                        $fail("The selected business partner is deactivated");
                    }else if (!$bp->is_sales){
                        $fail("The selected business partner does not accept sales");
                    }else if (!$bp->is_shipping){
                        $fail("The selected business partner does not accept shipping");
                    }else if (!$bp->customer){
                        $fail("The selected business partner is not a customer");
                    }
                }
            ],
            'currency_id' => ['required', 'string', Rule::exists('currencies', 'id')],
            'sale_row' => ['required', 'array'],
            'sale_row.item_id' => ['required_if:sale_row.standard_product_id,null', 'string', 'nullable', function($attribute, $value, $fail){
                $item = 
                    Item::whereIn('IDcompany', [0, auth()->user()->IDcompany])
                        ->whereHas('itemEnabledCompany')
                        ->where('IDitem', $value)
                        ->first();

                if(!$item){
                    $fail('The selected item is not allowed');
                }
            }],
            'sale_row.standard_product_id' => [
                'required_if:sale_row.item_id, null', 
                'string', 
                'nullable', 
                Rule::exists('standard_products', 'id')
                    ->where('company_id', auth()->user()->IDcompany)
            ],
            'sale_row.configuration' => [
                'required_with:sale_row.standard_product_id', 
                'prohibits:sale_row.item_id', 
                'nullable', 
                'array'
            ],
            'sale_row.quantity' => ['required', 'numeric', 'gt:0'],
            'sale_row.workcenter_id' => ['required', 'string', Rule::exists('workcenters', 'id')->where('company_id', auth()->user()->IDcompany)],
            'sale_row.override_total_discount' => ['sometimes', 'nullable', 'numeric']
        ];
    }


    public function attributes()
    {
        return [
            'sale_row.item_id' => 'item',
            'sale_row.standard_product_id' => 'standard product',
            'sale_row.configuration' => 'configuration',
            'sale_row.quantity' => 'quantity',
            'sale_row.workcenter_id' => 'workcenter',
            'sale_row.override_total_discount' => 'override total discount',
        ];
    }
}
