<?php

namespace App\Http\Requests;

use App\Rules\ActiveConstraint;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBulkProductSalePricingRulesRequest extends FormRequest
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
            'sale_pricing' => [
                'present', 
                'array', 
            ],
            "sale_pricing.*.position" => [
                'required',
                'integer', 
            ],
            "sale_pricing.*.name" => [
                'required',
                'string',
            ],
            "sale_pricing.*.constraints" => [
                'required', 
                'array', 
                'min:1'
            ],
            "sale_pricing.*.constraints.*.position" => [
                'required',
                'integer', 
            ],
            "sale_pricing.*.constraints.*.constraint_id" => [
                'required',
                'string',
                Rule::exists('constraints', 'id')->where(function ($query) {
                    return $query
                        ->where('constraint_type_id', 'price');
                }),
                new ActiveConstraint()
            ],
        ];
    }
}
