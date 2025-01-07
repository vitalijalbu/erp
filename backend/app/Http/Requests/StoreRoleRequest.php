<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{

    public function authorize(): bool
    {
        if(!empty(request()->route()->parameters['role'])) {
            return !request()->route()->parameters['role']->system;
        }
        
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('role');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "name" => [
                ...$required, 
                'string', 
                Rule::unique('App\Models\Role')->when(
                    $this->route()->parameter('role'), 
                    function($rule, $role) {
                        $rule->ignore($role->id);
                    }
                )
            ],
            "label" => [...$required, 'string'],
            "permissions" => [...$required, 'array'],
            'permissions.*' => ['required', 'integer', 'exists:App\Models\Permission,id'],
        ];
    }
}
