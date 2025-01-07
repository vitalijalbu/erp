<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;
use App\Rules\AlphaUnderscore;


class CloneStandardProductRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            "code" => [
               'required', 
                'string', 
                new AlphaUnderscore(),
                'unique:standard_products,code'
            ],
            "prefix" => [
                'required', 
                 'string', 
                 new AlphaUnderscore(),
             ],
        ];
    }
}
