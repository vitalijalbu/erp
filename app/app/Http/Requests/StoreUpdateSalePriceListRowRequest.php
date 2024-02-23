<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use App\Models\SalePriceListRow;
use Illuminate\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateSalePriceListRowRequest extends FormRequest
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
            'order' => ['required', 'integer'],
            'item_id' => [
                Rule::prohibitedIf(function(){
                    return $this->item_group_id || $this->item_subfamily_id;
                }),
                'required_without_all:item_group_id,item_subfamily_id',
                'string', 'nullable', 
                Rule::exists('item', 'IDitem')
                    ->whereIn('IDcompany', [0, auth()->user()->IDcompany])
                    ->where(function($q){
                        $q->where('configured_item', false)->orWhereNull('configured_item');
                    }),
            ],
            'item_group_id' => [
                Rule::prohibitedIf(function(){
                    return $this->item_id || $this->item_subfamily_id;
                }),
                'required_without_all:item_subfamily_id,item_id',
                'string', 
                'nullable', 
                Rule::exists('item_group', 'id')->whereIn('IDcompany', [0, auth()->user()->IDcompany])
            ],
            'item_subfamily_id' => [
                Rule::prohibitedIf(function(){
                    return $this->item_group_id || $this->item_id;
                }),
                'required_without_all:item_group_id,item_id',
                'string', 'nullable', Rule::exists('items_subfamilies', 'id')->whereIn('company_id', [0, auth()->user()->IDcompany])
            ],
            'quantity' => ['sometimes', 'nullable', 'numeric', 'gt:0'],
            'width' => ['sometimes', 'nullable', 'numeric', 'gt:0'],
            // 'class' => [],
            'date_from' => ['sometimes', 'nullable', 'date'],
            'date_to' => ['sometimes', 'nullable', 'date', 'after_or_equal:date_from'],
            'price' => ['required', 'numeric', 'gte:0'],
            'note' => ['sometimes', 'nullable', 'string']
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $validated = array_merge(
                    $this->validated(), [
                        'sales_price_list_id' => $this->salePriceList->id
                    ] 
                );

                $response = SalePriceListRow::checkOverlappingDates(auth()->user()->IDcompany, $validated);

                if($response){
                    foreach($response as $data){
                        $validator->errors()->add(
                            $data['key'],
                            $data['message']
                        );
                    }
                    
                }else{
                    if(!$this->date_from && !$this->dateTo){
                        $salePriceListRow = 
                            SalePriceListRow::exists(
                                auth()->user()->IDcompany, 
                                $validated
                            )->first();

                        if($salePriceListRow){
                            abort(400, "You cannot add this new sales price list row because there is already one equal");
                        }
                    }
                }
            }
        ];
    }
}
