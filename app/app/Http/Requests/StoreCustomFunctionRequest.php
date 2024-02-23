<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Rules\AlphaUnderscore;
use App\Rules\PhpName;


class StoreCustomFunctionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('function');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "id" => [
                $isNew ? 'required' : 'prohibited', 
                'string', 
                new AlphaUnderscore(),
                'unique:custom_functions'
            ],
            "label" => [
                ...$required, 
                'string',
                $isNew ? 
                    'unique:custom_functions,label' : 
                    Rule::unique('custom_functions', 'label')->ignore($this->route()->parameter('function')->label, 'label'),
            ],
            "description" => [
                'nullable', 
                'string',
            ],
            "arguments" => [
                ...($isNew ? ['present', 'nullable'] : ['nullable']),
                'nullable',
                'array'
            ],
            "arguments.*.name" => [
                'required',
                'string',
                'distinct',
                new PhpName()
            ],
            "body" => [
                ...$required,
                'array'
            ],
            "custom_function_category_id" => [
                'nullable', 
                'integer',
                'exists:custom_function_categories,id',
            ],
        ];
    }
}
