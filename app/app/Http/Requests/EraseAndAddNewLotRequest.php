<?php

namespace App\Http\Requests;

use App\Models\AdjustmentType;
use App\Models\Stock;
use Illuminate\Foundation\Http\FormRequest;

class EraseAndAddNewLotRequest extends FormRequest
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
        $this->route('stock')->loadMissing([
            'lot.dimensions' => function($q){
                $q->where('IDcompany', auth()->user()->IDcompany);
            },
            'lot.item.unit'
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $dimDefault = [
            'de' => ['nullable', 'numeric', 'gte:0.1'],
            'di' => ['nullable', 'numeric', 'gte:0.1'],
            'la' => ['nullable', 'numeric', 'gte:0.1'],
            'lu' => ['nullable', 'numeric', 'gte:0.1'],
            'pz' => ['nullable', 'numeric', $this->route('stock')->lot->item->um == 'N' ? 'gte:1' : 'gte:0.1']
        ];

        $stock = $this->route('stock');

        $data = [
            'idAdjustmentType' => ['required', 'exists:'.AdjustmentType::class.',IDadjtype']
        ];

        $dimensionsWithValue = $stock->lot->dimensions->mapWithKeys(function($el){
            return [strtolower($el->IDcar) => $el->val];
        })->toArray();

        foreach($dimDefault as $k => $v){
            if(array_key_exists($k, $dimensionsWithValue)){
                $dimDefault[$k] = preg_replace('/^nullable$/', 'required', $dimDefault[$k]);

                if($stock->lot->item->unit->frazionabile){
                    request()->merge([
                        $k => $dimensionsWithValue[$k]
                    ]);
                }
            }else{
                request()->request->remove($k);
            }
        }

        if($stock->lot->item->unit->frazionabile){
            $data += [
                'qty' => ['required', 'numeric']
            ];            
        }else{
            request()->request->remove('qty');
        }

        return $data + $dimDefault;
    }
}
