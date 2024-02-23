<?php

namespace App\Http\Requests;

use App\Models\ConstraintSubtype;
use App\Models\ConstraintType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Rules\AlphaUnderscore;
use App\Rules\PhpName;


class CloneConstraintRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            "new_id" => [
                'required', 
                'string', 
                new AlphaUnderscore(),
                'unique:constraints,id'
            ],
        ];
    }
}
