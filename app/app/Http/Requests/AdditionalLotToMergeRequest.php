<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class AdditionalLotToMergeRequest extends FormRequest
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
            'idItem' => ['required', Rule::exists('item', 'IDitem')],
            'idWarehouse' => ['required', Rule::exists('warehouse', 'IDwarehouse')->where('IDcompany', auth()->user()->IDcompany)],
        ];
    }
}
