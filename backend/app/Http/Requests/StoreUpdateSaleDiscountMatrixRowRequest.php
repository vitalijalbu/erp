<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use App\Models\SaleDiscountMatrixRow;
use Illuminate\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateSaleDiscountMatrixRowRequest extends FormRequest
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
                    })
            ],
            'item_group_id' => [
                Rule::prohibitedIf(function(){
                    return $this->item_id || $this->item_subfamily_id;
                }),
                'required_without_all:item_subfamily_id,item_id',
                'string', 'nullable', Rule::exists('item_group', 'id')->whereIn('IDcompany', [0, auth()->user()->IDcompany])
            ],
            'item_subfamily_id' => [
                Rule::prohibitedIf(function(){
                    return $this->item_group_id || $this->item_id;
                }),
                'required_without_all:item_group_id,item_id',
                'string', 'nullable', Rule::exists('items_subfamilies', 'id')->whereIn('company_id', [0, auth()->user()->IDcompany])
            ],
            'quantity' => ['sometimes', 'nullable', 'numeric', 'gt:0'],
            'date_from' => ['sometimes', 'nullable', 'date'],
            'date_to' => ['sometimes', 'nullable', 'date', 'after_or_equal:date_from'],
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
                        'sale_discount_matrix_id' => $this->saleDiscountMatrix->id
                    ] 
                );

                $response = SaleDiscountMatrixRow::checkOverlappingDates(auth()->user()->IDcompany, $validated);

                if($response){
                    foreach($response as $data){
                        $validator->errors()->add(
                            $data['key'],
                            $data['message']
                        );
                    }
                    
                }else{
                    if(!$this->date_from && !$this->dateTo){
                        $saleDiscountMatrixRow = 
                            SaleDiscountMatrixRow::exists(
                                auth()->user()->IDcompany, 
                                $validated
                            )->first();

                        if($saleDiscountMatrixRow){
                            abort(400, "You cannot add this new sales discount matrix row because there is already one equal");
                        }
                    }
                }
            }
        ];
    }
}
