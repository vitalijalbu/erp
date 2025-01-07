<?php

namespace App\Http\Requests;

use App\Models\BP;
use App\Models\Lot;
use App\Models\Item;
use App\Models\Warehouse;
use App\Models\Transaction;
use App\Models\UmDimension;
use Illuminate\Validation\Rule;
use App\Models\WarehouseLocation;
use Illuminate\Foundation\Http\FormRequest;

class ReceiptPurchaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    protected function prepareForValidation()
    {
        if($this->idItem){
            $this->merge([
                'um' => Item::where('IDitem', $this->idItem)->firstOrFail()->um
            ]);
        }
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
            'pz' => ['nullable', 'numeric', $this->um == 'N' ? 'gte:1' : 'gte:0.1']
        ];

        if($this->idItem){
            
            $dimensions = array_map('strtolower', UmDimension::where('IDdim', $this->um)->get()->pluck('IDcar')->toArray());

            foreach($dimDefault as $k => $v){
                if(in_array($k, $dimensions)){
                    $dimDefault[$k] = preg_replace('/^nullable$/', 'required', $dimDefault[$k]);
                }else{
                    request()->request->remove($k);
                }
            }
        }
        
        return [
            // 'ordRiferimento' => ['required', 'exists:'.Transaction::class.',ord_rif'],
            // 'lotFornitore' => ['required', 'exists:'.Lot::class.',IDlot_fornitore'],
            'ordRiferimento' => ['nullable'],
            'lotFornitore' => ['nullable'],
            'deliveryNote' => ['required'],
            'eur1' => ['nullable', 'boolean'],
            'confItem' => ['nullable', 'boolean'],
            'lotDate' => ['required', 'date'],
            'idWarehouse' => ['required', Rule::exists('warehouse', 'IDwarehouse')->where(function ($query) use ($user) {
                $query->where('IDcompany', $user->IDcompany);
            })],
            'idWarehouseLocation' => ['required', Rule::exists('warehouse_location', 'IDlocation')->where(function ($query) use ($user) {
                $query->where('IDcompany', $user->IDcompany)->where('IDwarehouse', $this->idWarehouse);
            })],
            'idItem' => ['required', 'exists:'.Item::class.',IDitem'],
            'idBP' => ['required', Rule::exists('bp', 'IDbp')->where(function ($query) use ($user) {
                $query->where('supplier', 1)->where('IDcompany', $user->IDcompany);
            })],  
        ] + $dimDefault;
    }
}
