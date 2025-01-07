<?php

namespace App\Http\Requests;

use App\Models\FeatureAttribute;
use App\Models\ProductConfigurationFeature;
use App\Rules\ActiveConstraint;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Rules\AlphaUnderscore;
use Illuminate\Database\Query\Builder;


class StoreFeatureStandardProductRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('feature');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "id" => [
                'prohibited'
            ],
            "feature_id" => [
                ...$required,
                'string', 
                'exists:features,id',
                function($attribute, $value, $fail) {
                    $p = ProductConfigurationFeature::where([
                        $attribute => $value,
                        'standard_product_id' => $this->route()->parameter('product')->id
                    ])
                    ->when($this->route()->parameter('feature'), function($q){
                        $q->where('id', '<>', $this->route()->parameter('feature')->id);
                    })
                    ->first();

                    if($p){
                        $fail("The feature {$value} already exists for the selected product.");
                    }
                }
            ],
            "main_product" => [
                'nullable',
                'boolean', 
            ],
            "readonly" => [
                'nullable',
                'boolean', 
            ],
            "position" => [
                ...$required,
                'integer', 
            ],
            "hidden" => [
                'nullable',
                'boolean', 
            ],
            "multiple" => [
                'nullable',
                'boolean', 
            ],
            "validation_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('constraints', 'id')->where(function (Builder $query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->where('subtype', 'validation');
                }),
                new ActiveConstraint()
            ],
            "activation_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('constraints', 'id')->where(function (Builder $query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->where('subtype', 'activation');
                }),
                new ActiveConstraint()
            ],
            "value_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('constraints', 'id')->where(function (Builder $query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->where('subtype', 'value');
                }),
                new ActiveConstraint()
            ],
            "dataset_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('constraints', 'id')->where(function (Builder $query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->where('subtype', 'dataset');
                }),
                new ActiveConstraint()
            ],
            "feature_attribute_id" => [
                'nullable',
                'string',
                Rule::exists(FeatureAttribute::class, 'id'),
                function($attribute, $value, $fail) use ($isNew) {
                    $attr = FeatureAttribute::find($value);
                    if(!$attr->multiple) {
                        $exists = ProductConfigurationFeature::where('standard_product_id', $this->route()->parameter('product')->id)
                            ->where('feature_attribute_id', $value)
                            ->when(!$isNew, function($query) {
                                $query->where('is', $this->route()->parameter('feature')->id);
                            })
                            ->first();
                        if($exists){
                            $fail("The attribute {$value} cannot be selected multiple times.");
                        }
                    }
                }
            ],
        ];
    }
}
