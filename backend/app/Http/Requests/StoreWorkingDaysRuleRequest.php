<?php

namespace App\Http\Requests;

use App\Models\SaleSequence;
use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use PrinsFrank\Standards\Language\LanguageAlpha2;

class StoreWorkingDaysRuleRequest extends FormRequest
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
        $isNew = !$this->route()->parameter('rule');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            'type' => [
                ...$required, 
                'boolean', 
            ],
            'start' => [
                ...$required, 
                'string', 
                'date_format:Y-m-d'
            ],
            'end' => [
                'sometimes',
                'nullable',  
                'date_format:Y-m-d', 
                'after_or_equal:start'
            ],
            'days_of_week' => [
                'sometimes',
                'array', 
            ],
            'days_of_week.*' => [
                'integer',
                'distinct',
                'min:1',
                'max:7',
            ],
            'repeat' => [
                ...$required, 
                'boolean', 
            ],
            'note' => [
                'sometimes',
                'nullable',  
                'string', 
            ],
        ];
    }
}
