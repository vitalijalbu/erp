<?php

namespace App\Http\Requests;

use App\Models\BP;
use App\Models\Item;
use App\Enum\ItemType;
use App\Enum\SaleType;
use App\Enum\SaleState;
use Illuminate\Validation\Rule;
use App\Rules\CheckServiceItemFields;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRowRequest extends StoreSaleRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $parentRules = parent::rules();
        
        $rowsRules =  array_filter($parentRules, fn($k) => str_starts_with($k, 'sale_rows.*.'), \ARRAY_FILTER_USE_KEY);
        $rules = [];
        foreach($rowsRules as $k => $_rules) {
            $newK = substr($k, 12);
            foreach($_rules as $ruleKey => $rule) {
                if(is_string($rule)) {
                    $_rules[$ruleKey] = preg_replace('/sale_rows\.\*\./i', '', $rule);
                }
            }
            $rules[$newK] = $_rules;
        }

        $rules['destination_address_id'] = [
            'nullable', 
            'string', 
            new CheckServiceItemFields, 
            function($attribute, $value, $fail){
                $bp = 
                    BP::where('IDbp', $this->route('sale')->bp_id)
                        ->where('is_shipping', 1)
                        ->with('addresses', function($q){
                            $q->where('is_shipping', 1);
                        })->first();

                $addresses = collect($bp?->addresses->pluck('id'))->merge($bp?->shipping_address_id)->unique();
                
                if($addresses->isEmpty()){
                    $fail("The selected business partner does not have valid shipping addresses");
                }
                elseif(!in_array($value, $addresses->toArray())){
                    $fail("The selected shipping addresses in not valid");
                }
            }
        ];

        return $rules;
    }

    public function attributes()
    {
        $parentAttributes = parent::attributes();

        $rowsAttributes =  array_filter($parentAttributes, fn($k) => str_starts_with($k, 'sale_rows.*.'), \ARRAY_FILTER_USE_KEY);
        $attributes = [];
        foreach($rowsAttributes as $k => $attribute) {
            $newK = substr($k, 12);
            $attributes[$newK] = $attribute;
        }

        return $attributes;
    }
}
