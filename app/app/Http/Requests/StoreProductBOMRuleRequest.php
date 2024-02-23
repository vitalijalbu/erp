<?php

namespace App\Http\Requests;

use App\Models\ProductConfigurationFeature;
use App\Rules\ActiveConstraint;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Rules\AlphaUnderscore;
use Illuminate\Database\Query\Builder;


class StoreProductBOMRuleRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('rule');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "id" => [
                'prohibited'
            ],
            "position" => [
                ...$required,
                'integer', 
            ],
            "constraint_id" => [
                ...$required,
                'string',
                Rule::exists('constraints', 'id')->where(function (Builder $query) {
                    return $query
                        ->where('constraint_type_id', 'bom')
                        ->where('company_id', auth()->user()->IDcompany);
                }),
                new ActiveConstraint()
            ],
        ];
    }
}
