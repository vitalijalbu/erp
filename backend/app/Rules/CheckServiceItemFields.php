<?php

namespace App\Rules;

use Closure;
use App\Models\Item;
use App\Enum\ItemType;
use Illuminate\Contracts\Validation\ValidationRule;

class CheckServiceItemFields implements ValidationRule
{
    /**
     * Indicates whether the rule should be implicit.
     *
     * @var bool
     */
    public $implicit = true;

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $parts = explode('.', $attribute);
        if(count($parts) > 1) {
            $row = request()->sale_rows[$parts[1]];
        }
        else {
            $row = request()->all();
        }

        if ($row['item_id']){
            $item = 
                Item::whereIn('IDcompany', [0, auth()->user()->IDcompany])
                    ->whereHas('itemEnabledCompany')
                    ->where('IDitem', $row['item_id'])
                    ->firstOrFail();

            if($item->type == ItemType::service){
                if(!is_null($value)){ 
                    $fail("The :attribute is prohibited when the item is a service.");
                }
            }elseif(!$value){
                $fail("The :attribute is required.");
            }
        }else if($row['standard_product_id']){
            if(!$value){
                $fail("The :attribute is required.");
            }
        }
    }
}
