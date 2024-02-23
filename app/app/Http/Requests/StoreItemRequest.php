<?php

namespace App\Http\Requests;

use App\Enum\ItemType;
use App\Models\BP;
use App\Models\ItemLine;
use App\Models\WeightUm;
use App\Models\ItemSubfamily;
use Illuminate\Validation\Rule;
use App\Models\ItemClassification;
use Illuminate\Database\Query\Builder;
use App\Models\ItemClassificationPivot;
use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('item');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "item_desc" => [
                ...$required, 
                'string', 
            ],
            "long_description" => [
                'nullable',
                'string', 
            ],
            'type' => [
                'required', 'string', Rule::in(collect(ItemType::cases())->pluck('name')->toArray())
            ],
            "um" => [
                ...$required, 
                'string',
                Rule::exists('App\Models\Um', 'IDdim')
            ],
            "item_group" => [
                ...$required, '
                string',
                Rule::exists('App\Models\ItemGroup', 'item_group')
                    ->where(function (Builder $query) {
                        return $query->where('IDcompany', auth()->user()->IDcompany);
                    })
            ],
            "product_line" => [
                ...$required, 'string', Rule::exists(ItemLine::class, 'id')->where(function($q){
                    $q->whereIn('company_id', [0, auth()->user()->IDcompany]);
                })
            ],
            "item_subgroup" => [
                ...$required, 'string', Rule::exists(ItemSubfamily::class, 'id')->where(function($q){
                    $q->whereIn('company_id', [0, auth()->user()->IDcompany]);
                })
            ],
            "weight_um" => [
                Rule::requiredIf(function(){
                    return in_array($this->type, [ItemType::product->name, ItemType::purchased->name]);
                }),
                Rule::prohibitedIf(function(){
                    return !in_array($this->type, [ItemType::product->name, ItemType::purchased->name]);
                }), 
                'string', 'nullable', Rule::exists(WeightUm::class, 'id')
            ],
            'weight' => [
                Rule::requiredIf(function(){
                    return in_array($this->type, [ItemType::product->name, ItemType::purchased->name]);
                }), Rule::prohibitedIf(function(){
                    return !in_array($this->type, [ItemType::product->name, ItemType::purchased->name]);
                }), 'numeric', 'gte:0'
            ],
            'number_of_plies' => [
                'string', Rule::prohibitedIf(function(){
                    return !in_array($this->type, [ItemType::product->name, ItemType::purchased->name]);
                }), 'nullable'
            ],
            // 'classification_l1' => [
            //     'sometimes', 'nullable', 'string', Rule::exists(ItemClassification::class, 'id')->where('level', 1)
            // ],
            // 'classification_l2' => [
            //     Rule::requiredIf(function(){
            //         if($this->classification_l1){
            //             return ItemClassification::where('id', $this->classification_l1)->where('require_level_2', true)->first();
            //         }
            //     }), 
            //     Rule::prohibitedIf(function(){
            //         return !$this->classification_l1;
            //     }),
            //     'string',
            //     'nullable', 
            //     Rule::exists(ItemClassification::class, 'id')->where('level', 2)->whereIn('id', ItemClassificationPivot::where('level_1_item_classification_id', $this->classification_l1)->pluck('level_2_item_classification_id')->toArray())
            // ],
            // 'owner' => [
            //     Rule::prohibitedIf(function(){
            //         return !$this->classification_l2 || ItemClassification::where('id', $this->classification_l2)->where('allow_owner', 0)->first();
            //     }),
            //     'string',
            //     'nullable',
            //     Rule::exists(BP::class, 'IDbp')->where('customer', 1)->where('IDcompany', auth()->user()->IDcompany)
            // ],
            'customs_code' => [
                'sometimes', 'string', 'nullable', Rule::prohibitedIf(function(){
                    return !in_array($this->type, [ItemType::product->name, ItemType::purchased->name]);
                }),
            ],
            'configurator_only' => [
                'sometimes',
                'nullable',
                'boolean'
            ]
        ];
    }
}
