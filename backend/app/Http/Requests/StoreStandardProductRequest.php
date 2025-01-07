<?php

namespace App\Http\Requests;

use App\Models\Company;
use App\Rules\ActiveConstraint;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;
use App\Rules\AlphaUnderscore;


class StoreStandardProductRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('product');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "id" => [
                'prohibited'
            ],
            "code" => [
                $isNew ? 'required' : 'prohibited', 
                'string', 
                new AlphaUnderscore(),
                'unique:standard_products,code'
            ],
            "name" => [
                ...$required, 
                'string',
                $isNew ? 
                    'unique:standard_products,name' : 
                    Rule::unique('standard_products', 'name')->ignore($this->route()->parameter('product')->name, 'name'),
            ],
            "company_id" => [
                ...$required,
                'nullable', 
                'integer',
                Rule::exists(Company::class, 'IDcompany')->where(function (Builder $query) {
                    return $query
                        ->where('IDcompany', '<>', 0);
                })
            ],
            "item_group_id" => [
                ...$required,
                'string',
                Rule::exists('App\Models\ItemGroup', 'item_group')->where(function (Builder $query) {
                    return $query
                        ->where('IDcompany', $this->company_id)
                        ->orWhere('IDcompany', 0);
                })
            ],
            "um_id" => [
                ...$required,
                'string',
                'exists:um,IDdim',
            ],
            "description_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('App\Models\Constraint', 'id')->where(function (Builder $query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->Where('subtype', 'value');
                }),
                new ActiveConstraint()
            ],
            "long_description_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('App\Models\Constraint', 'id')->where(function (Builder $query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->Where('subtype', 'value');
                }),
                new ActiveConstraint()
            ],
            "production_description_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('App\Models\Constraint', 'id')->where(function (Builder $query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->Where('subtype', 'value');
                }),
                new ActiveConstraint()
            ],
        ];
    }
}
