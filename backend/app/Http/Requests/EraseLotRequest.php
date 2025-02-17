<?php

namespace App\Http\Requests;

use App\Models\AdjustmentType;
use Illuminate\Foundation\Http\FormRequest;

class EraseLotRequest extends FormRequest
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
            'idAdjustmentType' => ['required', 'exists:'.AdjustmentType::class.',IDadjtype']
        ];
    }
}
