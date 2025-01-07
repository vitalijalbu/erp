<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Rules\AlphaUnderscore;

class StoreFeatureRequest extends FormRequest
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
                $isNew ? 'required' : 'prohibited', 
                'string', 
                new AlphaUnderscore(),
                'unique:features'
            ],
            "label" => [
                ...$required, 
                'string',
                $isNew ? 
                    'unique:features,label' : 
                    Rule::unique('features', 'label')->ignore($this->route()->parameter('feature')->label, 'label'),
            ],
            "feature_type_id" => [
                ...$required, 
                'string',
                'exists:feature_types,id'
            ],
        ];
    }
}
