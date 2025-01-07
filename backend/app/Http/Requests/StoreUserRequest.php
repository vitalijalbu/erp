<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('user');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "IDcompany" => [...$required, 'integer', 'exists:App\Models\Company'],
            "username" => [
                ...$required, 
                'string', 
                Rule::unique('App\Models\User')->when(
                    $this->route()->parameter('user'), 
                    function($rule, $user) {
                        $rule->ignore($user->id);
                    }
                )
            ],
            "language" => [...$required, Rule::enum(\PrinsFrank\Standards\Language\LanguageAlpha2::class)],
            "IDwarehouseUserDef" => ['nullable', 'string', Rule::exists('warehouse', 'IDwarehouse')->where('IDcompany', $this->IDcompany)],
            "clientTimezoneDB" => [...$required, 'string', 'timezone'],
            "decimal_symb" => [...$required, 'string'],
            "list_separator" => [...$required, 'string'],
            "roles" => [...$required, 'array'],
            'roles.*' => ['required', 'integer', 'exists:App\Models\Role,id'],
            'employee_contact_id' => [
                'sometimes',
                'nullable',
                'string',
                Rule::exists('contacts', 'id')->where('is_employee', true)->where('company_id', $this->IDcompany)
            ],
            'default_workcenter' => ['sometimes', 'nullable', 'string', Rule::exists('workcenters', 'id')->where('company_id', $this->IDcompany)]
        ];
    }
}
