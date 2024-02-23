<?php

namespace App\Http\Requests;

use App\Enum\ItemType;
use App\Rules\AlphaUnderscore;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateMachineRequest extends FormRequest
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
            'code' => [
                'required', 
                'string', 
                new AlphaUnderscore, 
                Rule::unique('machines', 'code')->where('company_id', auth()->user()->IDcompany)->ignore($this->machine)
            ],
            'workcenter_id' => ['required', 'string', Rule::exists('workcenters', 'id')->where('company_id', auth()->user()->IDcompany)],
            'cost_item_id' => [
                'required', 'string', 
                Rule::exists('item', 'IDitem')
                    ->where('IDcompany', auth()->user()->IDcompany)
                    ->where(function($query) {
                        return $query->where('configured_item', false)->orWhereNull('configured_item');
                    })
                    ->where('type', ItemType::cost)
            ],
            'men_occupation' => ['required', 'integer', 'gt:0'],
            'description' => ['sometimes', 'nullable', 'string']
        ];
    }
}
