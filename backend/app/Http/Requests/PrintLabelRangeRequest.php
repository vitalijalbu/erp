<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class PrintLabelRangeRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'fromLot' => ['nullable', 'required_with:toLot', Rule::exists('lot', 'IDlot')->where('IDcompany', auth()->user()->IDcompany), Rule::requiredIf(function(){
                return !$this->deliveryNote;
            })],
            'toLot' => ['nullable', 'required_with:fromLot', Rule::exists('lot', 'IDlot')->where('IDcompany', auth()->user()->IDcompany)],
            'deliveryNote' => ['nullable', 'string']
        ];
    }
}
