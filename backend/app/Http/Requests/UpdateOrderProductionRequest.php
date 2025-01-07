<?php

namespace App\Http\Requests;

use App\Models\Lot;
use App\Models\OrderProduction;
use App\Models\OrderProductionComponent;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderProductionRequest extends FormRequest
{
    private $localLot;
    private $order;
    private $localAttributes = [];
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function prepareForValidation()
    {
        $this->merge([
            'idComponents' => array_keys($this->components)
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $temp =  [
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

                $this->order = OrderProduction::where([
                    'IDcompany' => auth()->user()->IDcompany,
                    'IDlot' => $this->idLot
                ])->firstOrFail();
            }],
            'components' => ['required', 'array', 'min:1'],
            'components.*' => ['required', 'array'],
            'idComponents' => ['required', Rule::exists('order_production_components', 'IDcomp')->where(function($q){
                $q->where([
                    'IDcompany' => auth()->user()->IDcompany,
                    'IDord' => $this->order->IDord
                ]);
            })],
            
        ];

        $comp = [];

        foreach($this->idComponents as $id){
            $res = OrderProductionComponent::query()
                    ->where('IDcomp', $id)
                    ->where('IDcompany', auth()->user()->IDcompany)
                    ->with('item.unit')
                    ->firstOrFail();

            if($res->executed == 1){
                request()->request->replace(request()->except('components.'.$id));
                continue;
            }else{
                $comp["components.$id.method"] = ['present', 'in:0'];
                $comp["components.$id.qty"] = ['present', 'numeric'];

                if($res->item->unit->frazionabile == 1){
                    $comp["components.$id.method"] = ['required', 'boolean'];
                    $comp["components.$id.qty"] = ['required', 'numeric'];
                }
            }

            $comp["components.$id.idStock"] = ['required', Rule::exists('stock', 'IDstock')->where('IDcompany', auth()->user()->IDcompany)];

            $this->localAttributes = array_merge($this->localAttributes, [
                "components.$id.method" => 'method',
                "components.$id.qty" => 'qty',
                "components.$id.idStock" => 'idStock',
            ]);
        }

        return $temp + $comp + ['components.*.idStock' => ['distinct']];
    }

    public function attributes()
    {
        return $this->localAttributes;
    }
}
