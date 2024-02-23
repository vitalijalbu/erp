<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class ReceiptFromChiorinoRequest extends FormRequest
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
            'deliveryNote' => ['nullable', 'string', 'prohibits:idLot', Rule::exists('zETL_LN_lots_delivery_notes_from_biella', 't_deln')->where('IDcompany', auth()->user()->IDcompany), 
            Rule::requiredIf(function(){
                return !$this->idLot;
            })],
            'idLot' => ['nullable', 'string',  'prohibits:deliveryNote', Rule::exists('zETL_LN_lots_delivery_notes_from_biella', 't_clot')->where('IDcompany', auth()->user()->IDcompany)]
        ];
    }
}
