<?php

namespace App\Http\Requests;

use App\Enum\ItemType;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use App\Models\SaleTotalDiscountMatrixRow;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateSaleTotalDiscountMatrixRowRequest extends FormRequest
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
            'position' => ['required', 'integer'],
            'bp_group_id' => ['sometimes', 'nullable', 'string', Rule::exists('bp_groups', 'id')->where('company_id', auth()->user()->IDcompany)],
            'bp_id' => [
                'sometimes', 'string', 'nullable', 
                Rule::exists('bp', 'IDbp')->where('IDcompany', auth()->user()->IDcompany)->where('customer', 1)
            ],
            'item_id' => [
                Rule::prohibitedIf(function(){
                    return $this->item_group_id || $this->item_subfamily_id;
                }),
                //'required_without_all:item_group_id,item_subfamily_id',
                'string', 'nullable', 
                Rule::exists('item', 'IDitem')
                    ->whereIn('IDcompany', [0, auth()->user()->IDcompany])
                    ->where(function($q){
                        $q->where('configured_item', false)->orWhereNull('configured_item');
                    })
            ],
            'item_group_id' => [
                Rule::prohibitedIf(function(){
                    return $this->item_id || $this->item_subfamily_id;
                }),
                //'required_without_all:item_subfamily_id,item_id',
                'string', 'nullable', Rule::exists('item_group', 'id')->whereIn('IDcompany', [0, auth()->user()->IDcompany])
            ],
            'item_subfamily_id' => [
                Rule::prohibitedIf(function(){
                    return $this->item_group_id || $this->item_id;
                }),
                //'required_without_all:item_group_id,item_id',
                'string', 'nullable', Rule::exists('items_subfamilies', 'id')->whereIn('company_id', [0, auth()->user()->IDcompany])
            ],
            'service_item_id' => [
                'present',
                'nullable', 
                'string', 
                Rule::exists('item', 'IDitem')
                    ->whereIn('IDcompany', [0, auth()->user()->IDcompany])
                    ->where('type', ItemType::service->value)
            ],
            'quantity' => ['sometimes', 'nullable', 'numeric', 'gt:0'],
            'width' => ['sometimes', 'nullable', 'numeric', 'gt:0'],
            'value' => ['required', 'numeric', 'min:-100'],
            'note' => ['sometimes', 'nullable', 'string']
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $validated = array_merge(
                    $this->validated(), [
                        'sale_total_discount_matrix_id' => $this->saleTotalDiscountMatrix->id
                    ] 
                );

                $saleTotalDiscountMatrixRow = 
                    SaleTotalDiscountMatrixRow::exists(
                        auth()->user()->IDcompany, 
                        $validated
                    )->first();

                if($saleTotalDiscountMatrixRow){
                    abort(400, "You cannot add this new sales total discount matrix row because there is already one equal");
                }
            }
        ];
    }
}
