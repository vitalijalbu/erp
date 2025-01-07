<?php

namespace App\Http\Requests;

use App\Models\Lot;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCuttingRequest extends FormRequest
{
    private $localLot;
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
            'idLot' => ['required', function($attribute, $value, $fail){
                $this->localLot = Lot::query()
                    ->where([
                        'IDcompany' => auth()->user()->IDcompany,
                        'IDlot' => $this->idLot
                    ])
                    ->whereHas('item', function($q){
                        $q->where('um', 'm2');
                    })
                    ->with('stocks')
                    ->firstOrFail();

                if(!$this->localLot->stocks->first()?->IDwarehouse){
                    $fail('Lot not in stock.');
                }
            }],
            'la' => ['required', 'numeric', 'gte:0.1'],
            'lu' => ['required', 'numeric', 'gte:0.1'],
            'pz' => ['required', 'numeric', 'gte:1'],
            'ordRef' => ['nullable', 'string'],
            'idWarehouseLocation' => ['required', 'string', Rule::exists('warehouse_location', 'IDlocation')->where(function ($query) {
                $query->where('IDcompany', auth()->user()->IDcompany)->where('IDwarehouse', $this->localLot->stocks->first()->IDwarehouse);
            })],
            'stepRoll' => ['required', 'boolean'],
            'stepRollOrder' => [Rule::requiredIf(function(){
                return $this->stepRoll ? true : false;
            }), 'nullable', 'integer'],

        ];
    }
}
