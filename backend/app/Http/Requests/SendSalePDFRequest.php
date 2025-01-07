<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendSalePDFRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            "subject" => [
                'required', 
                'string', 
            ],
            "template" => [
                'required',
                'string'
            ],
            'to' => [
                'required',
                'array'
            ],
            'to.*' => [
                'required', 
                'string', 
                'email'
            ],
        ];
    }
}
