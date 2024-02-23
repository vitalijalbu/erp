<?php

namespace App\Http\Requests;

use App\Models\FeatureAttribute;
use App\Rules\ActiveConstraint;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBulkFeatureStandardProductRequest extends FormRequest
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
            'productConfigurationFeature' => ['required', 'array', 'min:1'],
            "productConfigurationFeature.*.id" => [
                'prohibited'
            ],
            "productConfigurationFeature.*.feature_id" => [
                'required',
                'string', 
                'exists:features,id',
                'distinct'
            ],
            "productConfigurationFeature.*.readonly" => [
                'nullable',
                'boolean', 
            ],
            "productConfigurationFeature.*.position" => [
                'required',
                'integer', 
            ],
            "productConfigurationFeature.*.hidden" => [
                'nullable',
                'boolean', 
            ],
            "productConfigurationFeature.*.multiple" => [
                'nullable',
                'boolean', 
            ],
            "productConfigurationFeature.*.validation_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('constraints', 'id')->where(function ($query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->where('subtype', 'validation');
                }),
                new ActiveConstraint()
            ],
            "productConfigurationFeature.*.activation_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('constraints', 'id')->where(function ($query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->where('subtype', 'activation');
                }),
                new ActiveConstraint()
            ],
            "productConfigurationFeature.*.value_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('constraints', 'id')->where(function ($query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->where('subtype', 'value');
                }),
                new ActiveConstraint()
            ],
            "productConfigurationFeature.*.dataset_constraint_id" => [
                'nullable',
                'string',
                Rule::exists('constraints', 'id')->where(function ($query) {
                    return $query
                        ->where('constraint_type_id', 'configurator')
                        ->where('subtype', 'dataset');
                }),
                new ActiveConstraint()
            ],
            "productConfigurationFeature.*.feature_attribute_id" => [
                'nullable',
                'string',
                Rule::exists(FeatureAttribute::class, 'id'),
                function($attribute, $value, $fail) {
                    $attr = FeatureAttribute::find($value);
                    if(!$attr->multiple) {
                        $counted = collect($this->productConfigurationFeature)->countBy(function ($row) {
                            return $row['feature_attribute_id'];
                        });
                        if($counted[$value] > 1) {
                            $fail("The attribute {$value} cannot be selected multiple times.");
                        }
                    }
                }
            ],
        ];
    }
}
