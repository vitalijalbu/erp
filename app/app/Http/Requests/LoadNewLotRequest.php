<?php

namespace App\Http\Requests;

use App\Models\AdjustmentType;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class LoadNewLotRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function prepareForValidation()
    {
        $this->route('item')->loadMissing([
            'unit.umDimensions'
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $user = auth()->user();

        $dimDefault = [
            'de' => ['nullable', 'numeric', 'gte:0.1'],
            'di' => ['nullable', 'numeric', 'gte:0.1'],
            'la' => ['nullable', 'numeric', 'gte:0.1'],
            'lu' => ['nullable', 'numeric', 'gte:0.1'],
            'pz' => ['nullable', 'numeric', $this->route('item')->um == 'N' ? 'gte:1' : 'gte:0.1']
        ];

        $item = $this->route('item');

        $dimensions = array_map('strtolower', $item->unit->umDimensions->pluck('IDcar')->toArray());

        foreach($dimDefault as $k => $v){
            if(in_array($k, $dimensions)){
                $dimDefault[$k] = preg_replace('/^nullable$/', 'required', $dimDefault[$k]);
            }else{
                request()->request->remove($k);
            }
        }

        return [
            'idAdjustmentType' => ['required', 'exists:'.AdjustmentType::class.',IDadjtype'],
            'lotText' => ['nullable', 'string'],
            'eur1' => ['required', 'boolean'],
            'confItem' => ['required', 'boolean'],
            'mergedLot' => ['required', 'boolean'],
            'idWarehouse' => ['required', Rule::exists('warehouse', 'IDwarehouse')->where(function ($query) use ($user) {
                $query->where('IDcompany', $user->IDcompany);
            })],
            'idWarehouseLocation' => ['required', Rule::exists('warehouse_location', 'IDlocation')->where(function ($query) use ($user) {
                $query->where('IDcompany', $user->IDcompany)->where('IDwarehouse', $this->idWarehouse);
            })],
            'dadLot' => ['nullable', Rule::exists('lot', 'IDlot')->where(function ($query) use ($user) {
                $query->where('IDcompany', $user->IDcompany);
            })]
        ] + $dimDefault;
    }
}
