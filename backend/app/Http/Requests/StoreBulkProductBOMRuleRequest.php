<?php

namespace App\Http\Requests;

use App\Rules\ActiveConstraint;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBulkProductBOMRuleRequest extends FormRequest
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
            'BOMRules' => ['required', 'array', 'min:1'],
            "BOMRules.*.id" => [
                'prohibited'
            ],
            "BOMRules.*.position" => [
                'required',
                'integer', 
            ],
            "BOMRules.*.constraint_id" => [
                'required',
                'string',
                Rule::exists('constraints', 'id')->where(function ($query) {
                    return $query
                        ->where('constraint_type_id', 'bom')
                        ->where('company_id', auth()->user()->IDcompany);
                }),
                new ActiveConstraint()
            ],
        ];
    }
}
