<?php

namespace App\Http\Requests;

use App\Models\Item;
use App\Models\UmDimension;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use App\Models\LnLotDeliveryNoteFromBiella;
use Illuminate\Foundation\Http\FormRequest;

class ConfirmReceiptRequest extends FormRequest
{
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
            'idRecords' => array_keys($this->lots)
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

        $temp = [
            'deliveryNote' => ['nullable', 'string', 'prohibits:idLot', Rule::exists('zETL_LN_lots_delivery_notes_from_biella', 't_deln')->where('IDcompany', auth()->user()->IDcompany), 
            Rule::requiredIf(function(){
                return !$this->idLot;
            })],
            'idLot' => ['nullable', 'string',  'prohibits:deliveryNote', Rule::exists('zETL_LN_lots_delivery_notes_from_biella', 't_clot')->where('IDcompany', auth()->user()->IDcompany)],
            'lots' => ['required', 'array', 'min:1'],
            'lots.*' => ['required', 'array'],
            'idRecords' => ['required', Rule::exists('zETL_LN_lots_delivery_notes_from_biella', 'IDrecord')->where(function($q) use ($user){
                $q->where([
                    'IDcompany' => $user->IDcompany
                ])
                ->when($this->deliveryNote, function($q){
                    $q->where('t_deln', $this->deliveryNote);
                })
                ->when($this->idLot, function($q){
                    $q->where('t_clot', $this->idLot);
                });
            })],
            'lots.*.received' => ['required','boolean']
        ];

        $rules = [];

        if($this->lots){
            
            foreach($this->lots as $idRecord => $data){  
                if(!array_key_exists('received', $data) || !$data['received']){
                    continue;
                }

                $lnLot = LnLotDeliveryNoteFromBiella::where([
                    'IDcompany' => $user->IDcompany,
                    'IDrecord' => $idRecord
                ])
                ->with('company')
                ->firstOrFail();               

                $um = Item::where('IDitem', $lnLot->IDitem)->firstOrFail()->um;

                $dimDefault = [];
                $dimDefault['lots.'.$idRecord.'.de'] = ['nullable','numeric', 'gte:0.1'];
                $dimDefault['lots.'.$idRecord.'.di'] = ['nullable','numeric', 'gte:0.1'];
                $dimDefault['lots.'.$idRecord.'.la'] = ['nullable','numeric', 'gte:0.1'];
                $dimDefault['lots.'.$idRecord.'.lu'] = ['nullable','numeric', 'gte:0.1'];
                $dimDefault['lots.'.$idRecord.'.pz'] = ['nullable','numeric', $um == 'N' ? 'gte:1' : 'gte:0.1'];

                

                $dimensions = array_map('strtolower', UmDimension::where('IDdim', $um)->get()->pluck('IDcar')->toArray());

                foreach($dimDefault as $k => $v){
                    if(in_array(substr($k, -2), $dimensions)){
                        $rules[$k] = preg_replace('/^nullable$/', 'required', $dimDefault[$k]);
                    }else{
                        request()->replace($this->except($k));
                    }
                }

                $lots = request()->lots;

                $lots[$idRecord] += [ 
                    'idItem' => $lnLot->IDitem,
                    'um' => $um,
                    'lotFornitore' => $lnLot->t_clot,
                    'idBP' => $lnLot->company->CSM_bpid_code,
                    'eur1' => $lnLot->eur1,
                    'confItem' => $lnLot->conf_item,
                    'lotVal' => $lnLot->t_amti,
                    'deliveryNote' => $lnLot->t_deln
                ];
              
                request()->merge(['lots' => $lots]);

                $rules['lots.'.$idRecord.'.lotDate'] = ['required','date'];
                $rules['lots.'.$idRecord.'.ordRef'] = ['required','string'];
                $rules['lots.'.$idRecord.'.lotText'] = ['nullable','string'];
                $rules['lots.'.$idRecord.'.idWarehouse'] = ['required', Rule::exists('warehouse', 'IDwarehouse')->where(function ($query) use ($user) {
                    $query->where('IDcompany', $user->IDcompany);
                })];
                $rules['lots.'.$idRecord.'.idWarehouseLocation'] = [
                    'required', 
                    Rule::exists('warehouse_location', 'IDlocation')->where(function ($query) use ($user, $data) {
                        $query->where('IDcompany', $user->IDcompany)->where('IDwarehouse', $data['idWarehouse']);
                    })
                ];

                $this->localAttributes += [
                    'lots.'.$idRecord.'.la' => 'la',
                    'lots.'.$idRecord.'.lu' => 'lu',
                    'lots.'.$idRecord.'.pz' => 'pz',
                    'lots.'.$idRecord.'.di' => 'di',
                    'lots.'.$idRecord.'.received' => 'received',
                    'lots.'.$idRecord.'.ordRef' => 'order reference',
                    'lots.'.$idRecord.'.lotDate' => 'lot date',
                    'lots.'.$idRecord.'.lotText' => 'lot text',
                    'lots.'.$idRecord.'.idWarehouse' => 'id warehouse',
                    'lots.'.$idRecord.'.idWarehouseLocation' => 'id warehouse location',
                ];
            }
        }

        return $temp + $rules;      
    }

    public function attributes()
    {
        return $this->localAttributes;
    }
}
