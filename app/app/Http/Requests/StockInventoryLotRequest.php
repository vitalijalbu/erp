<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StockInventoryLotRequest extends FormRequest
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
        $user = auth()->user();
        
        return [
            'id_warehouse' => ['required', Rule::exists('warehouse', 'IDwarehouse')->where(function ($query) use ($user) {
                $query->where('IDcompany', $user->IDcompany);
            })],
            'id_warehouse_location' => ['required', Rule::exists('warehouse_location', 'IDlocation')->where(function ($query) use ($user) {
                $query->where('IDcompany', $user->IDcompany)->where('IDwarehouse', $this->id_warehouse);
            })]
        ];
    }
}
