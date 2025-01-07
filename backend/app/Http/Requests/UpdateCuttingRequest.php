<?php

namespace App\Http\Requests;

use App\Models\Lot;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCuttingRequest extends FormRequest
{
    private $localLot;
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
            'idCuts' => array_keys($this->cuts)
        ]);
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
            'plannedDate' => ['nullable', 'date'],
            'cuts' => ['required', 'array', 'min:1'],
            'cuts.*' => ['required', 'array'],
            'idCuts' => ['required', Rule::exists('cutting_order_row', 'IDcut')->where('IDcompany', auth()->user()->IDcompany)->where('IDlot', $this->idLot)],
            'cuts.*.la' => ['required', 'numeric', 'gte:0.1'],
            'cuts.*.lu' => ['required', 'numeric', 'gte:0.1'],
            'cuts.*.pz' => ['required', 'numeric', 'gte:1'],
        ];
    }

    public function attributes()
    {
        return [
            'cuts.*.la' => 'la',
            'cuts.*.lu' => 'lu',
            'cuts.*.pz' => 'pz',
        ];
    }
}
