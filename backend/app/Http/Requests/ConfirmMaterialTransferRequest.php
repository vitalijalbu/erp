<?php

namespace App\Http\Requests;

use App\Models\Warehouse;
use Illuminate\Validation\Rule;
use App\Models\WarehouseLocation;
use Illuminate\Foundation\Http\FormRequest;

class ConfirmMaterialTransferRequest extends FormRequest
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
            'idWarehouse' => ['required', Rule::exists('warehouse', 'IDwarehouse')->where(function ($query) use ($user) {
                $query->where('IDcompany', $user->IDcompany);
            })],
            'idWarehouseLocation' => ['required', Rule::exists('warehouse_location', 'IDlocation')->where(function ($query) use ($user) {
                $query->where('IDcompany', $user->IDcompany)->where('IDwarehouse', $this->idWarehouse);
            })]
        ];
    }
}
