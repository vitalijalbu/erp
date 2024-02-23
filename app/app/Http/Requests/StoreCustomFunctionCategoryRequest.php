<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Rules\AlphaUnderscore;

class StoreCustomFunctionCategoryRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('category');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "name" => [
                ...$required, 
                'string',
                $isNew ? 
                    'unique:custom_function_categories,name' : 
                    Rule::unique('custom_function_categories', 'name')->ignore($this->route()->parameter('category')->name, 'name'),
            ],
            "parent_id" => [
                'nullable', 
                'integer',
                'exists:custom_function_categories,id',
                Rule::when(fn($input) => !$isNew, [
                    function (string $attribute, mixed $value, \Closure $fail) {
                        if ($value === $this->route()->parameter('category')->id) {
                            $fail("The category cannot be children of itself.");
                        }
                    },
                ])
            ],
        ];
    }
}
