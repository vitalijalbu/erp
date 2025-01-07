<?php

namespace App\Http\Requests;

use App\Models\ProductConfigurationFeature;
use App\Rules\ActiveConstraint;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Rules\AlphaUnderscore;
use Illuminate\Database\Query\Builder;


class StoreProductRoutingRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('routing');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "id" => [
                'prohibited'
            ],
            "position" => [
                ...$required,
                'integer', 
            ],
            "process_id" => [
                ...$required,
                'string',
                Rule::exists('processes', 'id')->where(function (Builder $query) {
                    return $query
                        ->where('company_id', auth()->user()->IDcompany);
                })
            ],
            "activation_constraint_id" => [
                ...$required,
                'string',
                Rule::exists('constraints', 'id')->where(function (Builder $query) {
                    return $query
                        ->where('constraint_type_id', 'routing')
                        ->where('subtype', 'routing_activation');
                }),
                new ActiveConstraint()
            ],
        ];
    }
}
