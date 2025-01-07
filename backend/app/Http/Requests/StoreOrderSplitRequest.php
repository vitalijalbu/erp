<?php

namespace App\Http\Requests;

use App\Models\Stock;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderSplitRequest extends FormRequest
{
    private $locStock;
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
        $temp = [
            'idStock' => ['required', 'numeric', Rule::exists('stock', 'IDstock')->where('IDcompany', auth()->user()->IDcompany)]
            
        ];

        $this->locStock = Stock::query()
                ->where('IDstock', $this->idStock)
                ->with('lot.item')
                ->whereHas('lot.item', function($q){
                    $q->where('um', '<>', 'm2');             
                })
                ->firstOrFail();

        $this->merge([
            'stock' => $this->locStock
        ]);

        $min = 1;

        if($this->locStock->lot->item->um == 'm'){
            $min = 0.1;
        }

        $temp += [
            'qty' => ['required', 'numeric', 'gte:'.$min],
            'ordRef' => ['nullable', 'string'],
            'idWarehouseLocation' => ['required', 'string', Rule::exists('warehouse_location', 'IDlocation')->where(function ($query) {
                $query->where('IDcompany', auth()->user()->IDcompany)->where('IDwarehouse', $this->locStock->IDwarehouse);
            })]
        ];

        return $temp;
    }
}
