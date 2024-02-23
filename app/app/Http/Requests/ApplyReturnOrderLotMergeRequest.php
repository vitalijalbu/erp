<?php

namespace App\Http\Requests;

use App\Models\OrderMerge;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class ApplyReturnOrderLotMergeRequest extends FormRequest
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
        return  [
            'idMerge' => ['required', Rule::exists('order_merge', 'IDmerge')->where('IDcompany', auth()->user()->IDcompany)],
            'LA' => ['required', 'numeric', 'gte:0.1'],
            'LU' => ['required', 'numeric', 'gte:0.1'],
            'PZ' => ['required', 'integer', 'gte:1'],
            'ordRef' => ['nullable', 'string'],
            'idWarehouseLocation' => ['required', Rule::exists('warehouse_location', 'IDlocation')->where(function ($query) {
                $query->where('IDcompany', auth()->user()->IDcompany);
            })]
        ];
    }
}
