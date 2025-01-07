<?php

namespace App\Http\Requests;

use App\Models\Warehouse;
use Illuminate\Validation\Rule;
use App\Models\WarehouseLocation;
use Illuminate\Foundation\Http\FormRequest;

class ConfirmMaterialIssueRequest extends FormRequest
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
            'idBP' => ['required', Rule::exists('bp', 'IDbp')->where(function ($query) use ($user) {
                $query->where('customer', 1)->where('IDcompany', $user->IDcompany);
            })],
            'idDestination' => ['required', Rule::exists('bp_destinations', 'IDdestination')->where(function($q) use ($user){
                $q->where('IDcompany', $user->IDcompany)->where('IDbp', $this->idBP);
            })],
            'ordRef' => ['required', 'string'],
            'deliveryNote' => ['required', 'string']
        ];
    }
}
