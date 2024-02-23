<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class OrderLotMergeViewRequest extends FormRequest
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
            'idStock' => ['required', 'integer', Rule::exists('stock', 'IDstock')->where('IDcompany', auth()->user()->IDcompany)],
            'idMerge' => ['present', 'nullable', 'integer']
        ];
    }
}
