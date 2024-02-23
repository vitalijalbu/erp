<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;

class ReportStockLimitRequest extends FormRequest
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
            'idWarehouse' => ['nullable', Rule::exists('App\Models\Warehouse', 'IDwarehouse')->where(function (Builder $query) {
                return $query->where('IDcompany', auth()->user()->IDcompany);
            })],
        ];
    }
}
