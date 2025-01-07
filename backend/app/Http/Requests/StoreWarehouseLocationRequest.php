<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;

class StoreWarehouseLocationRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('location');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "desc" => [
                ...$required, 
                'string', 
                Rule::unique('App\Models\WarehouseLocation')
                    ->where('IDwarehouse', $this->route()->parameter('warehouse')->IDwarehouse)
                    ->when(
                        $this->route()->parameter('location'), 
                        function($rule, $location) {
                            $rule
                                ->ignore($location->IDlocation, 'IDlocation');
                        }
                    )
            ],
            "note" => ["sometimes", "nullable", "string"],
            "IDwh_loc_Type" => [
                "sometimes", 
                "required",
                Rule::exists(\App\Models\WarehouseLocationType::class)
            ],
        ];
    }
}
