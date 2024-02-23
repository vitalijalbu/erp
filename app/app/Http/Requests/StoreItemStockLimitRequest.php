<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;

class StoreItemStockLimitRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $item = $this->route()->parameter('item');
        $valConstraints = $item->unit->decimal_on_stock_qty ? ['decimal:0,2', 'min:0.1'] : ['integer', 'min:1'];

        return [
            "IDwarehouse" => [
                "required",
                "string",
                Rule::exists('App\Models\Warehouse', 'IDwarehouse')
                    ->where(function (Builder $query) {
                        return $query->where('IDcompany', auth()->user()->IDcompany);
                    })
            ],
            "qty_min" => [
                'required',
                ...$valConstraints,
            ],
            "qty_max" => [
                'required',
                ...$valConstraints,
                'gt:qty_min'
            ],
        ];
    }
}
