<?php

namespace App\Http\Requests;

use App\Models\ConstraintSubtype;
use App\Models\ConstraintType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Rules\AlphaUnderscore;
use App\Rules\PhpName;
use App\Rules\RequireCompany;
use App\Rules\RequireSubtype;

class StoreConstraintRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('constraint');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "id" => [
                $isNew ? 'required' : 'prohibited', 
                'string', 
                new AlphaUnderscore(),
                'unique:constraints'
            ],
            "label" => [
                ...$required, 
                'string',
                $isNew ? 
                    'unique:constraints,label' : 
                    Rule::unique('constraints', 'label')->ignore($this->route()->parameter('constraint')->label, 'label'),
            ],
            "description" => [
                'nullable', 
                'string',
            ],
            "body" => [
                ...$required,
                'array'
            ],
            "constraint_type_id" => [
                ...$required, 
                'string',
                'exists:constraint_types,id',
            ],
            "subtype" => [
                'string',
                new RequireSubtype($isNew),
                function (string $attribute, mixed $value, \Closure $fail) {
                    if($this->route()->parameter('constraint')) {
                        if(
                            $this->route()->parameter('constraint')->subtype != $value && 
                            !$this->route()->parameter('constraint')->canChangeSubtype()
                        ) {
                            $fail("The constraint type cannot be changed because already used");
                        } 
                    }
                }
            ],
            'is_draft' => [
                'boolean',
                function (string $attribute, mixed $value, \Closure $fail) use ($isNew) {
                    if(!$value && (!$isNew && !$this->route()->parameter('constraint')->is_draft)) {
                        $fail("The constraint cannot be saved as draft after being saved normally");
                    }
                }
            ],
            "company_id" => [
                'string',
                new RequireCompany($isNew),
            ],
        ];
    }
}
