<?php

namespace App\Http\Requests;

use App\Models\Lot;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Database\Query\Builder;

class CuttingViewRequest extends FormRequest
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
            'idLot' => ['required', function(){
                Lot::query()
                    ->where([
                        'IDcompany' => auth()->user()->IDcompany,
                        'IDlot' => $this->idLot
                    ])
                    ->whereHas('item', function($q){
                        $q->where('um', 'm2');
                    })
                    ->firstOrFail();
            }]
        ];
    }
}
