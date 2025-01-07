<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;

class ConfiguratorInitRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            "product" => ['required', 'string', Rule::exists('standard_products', 'code')],
            "bp" => ['required', 'string', Rule::exists('bp', 'IDbp')],
            "configuration" => ['nullable', 'array'],
        ];
    }
}
