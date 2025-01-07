<?php

namespace App\Http\Requests;

use App\Models\Lot;
use Illuminate\Foundation\Http\FormRequest;

class ConfirmOrderProductionRequest extends FormRequest
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
            'idLot' => ['required', function($attribute, $value, $fail){
                $lot = 
                    Lot::query()
                        ->where([
                            'IDcompany' => auth()->user()->IDcompany,
                            'IDlot' => $this->idLot
                        ])
                        ->whereHas('item', function($q){
                            $q->where('um', 'm2');
                        })
                        ->with('stocks')
                        ->firstOrFail();

                // if(!$lot->stocks->first()?->IDwarehouse){
                //     $fail('Lot not in stock.');
                // }
            }],
        ];
    }
}
