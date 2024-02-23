<?php

namespace App\Http\Requests;

use App\Rules\ActiveConstraint;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBulkProductRoutingRequest extends FormRequest
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
            'routings' => ['required', 'array', 'min:1'],
            "routings.*.id" => [
                'prohibited'
            ],
            "routings.*.position" => [
                'required',
                'integer', 
            ],
            "routings.*.process_id" => [
                'required',
                'string',
                Rule::exists('processes', 'id')->where(function ($query) {
                    return $query
                        ->where('company_id', auth()->user()->IDcompany);
                })
            ],
            "routings.*.activation_constraint_id" => [
                'required',
                'string',
                Rule::exists('constraints', 'id')->where(function ($query) {
                    return $query
                        ->where('constraint_type_id', 'routing')
                        ->where('subtype', 'routing_activation');
                }),
                new ActiveConstraint()
            ],
        ];
    }
}
