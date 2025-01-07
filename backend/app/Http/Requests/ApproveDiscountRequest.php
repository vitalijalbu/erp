<?php

namespace App\Http\Requests;

use App\Models\BP;
use App\Models\Item;
use App\Enum\ItemType;
use App\Enum\SaleType;
use App\Enum\SaleState;
use App\Models\SaleRow;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Foundation\Http\FormRequest;

class ApproveDiscountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        if($this->route('sale')){
            $sale = $this->route('sale');
            if($sale->sale_type == SaleType::quotation){
                abort_if($sale->isExpired(), 400, "You cannot update this quotation because it's expired");
            }else{
                abort_if($sale->state != SaleState::inserted, 400, "You cannot update the order after it has been approved");
            }
        }

        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'row_id' => [
                'required', 
                'string', 
                Rule::exists(SaleRow::class, 'id')->where('sale_id', $this->route('sale')->id),
            ],
            'approve' => ['required', 'boolean']
        ];
    }
}
