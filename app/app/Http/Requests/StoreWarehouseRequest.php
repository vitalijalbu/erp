<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;
use Illuminate\Validation\Validator;


class StoreWarehouseRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('warehouse');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "desc" => [
                ...$required, 
                'string', 
            ],
            "IDcountry" => [
                ...$required, 
                'string', 
                Rule::exists(\App\Models\Country::class)
                    ->where(function (Builder $query){
                        return $query->where('IDcompany', auth()->user()->IDcompany);
                    })
            ],
        ];
    }

    public function withValidator(Validator $validator)
    {
        $validator->after(function ($validator) {
            if(\App\Models\Warehouse::where([
                ['IDcompany', auth()->user()->IDcompany],
                ['IDcountry', $this->input('IDcountry', $this->route()->parameter('warehouse')?->IDcountry)],
                ['desc', $this->input('desc', $this->route()->parameter('warehouse')?->IDcountry)],
            ])->when($this->route()->parameter('warehouse'), function (\Illuminate\Database\Eloquent\Builder $query, $warehouse) {
                $query->where('IDwarehouse', '<>', $warehouse->IDwarehouse);
            })->exists()) {
                $validator->errors()->add(
                    'desc',
                    'The warehouse with the same combination of company, country, and description, already exists'
                );
            }
        });
    }
}
