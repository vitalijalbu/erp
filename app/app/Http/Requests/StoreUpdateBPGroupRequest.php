<?php

namespace App\Http\Requests;

use App\Models\BPGroup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUpdateBPGroupRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            "name"=> ["required", "string", Rule::unique(BPGroup::class, 'name')->where('company_id', auth()->user()->IDcompany)->ignore($this->bpGroup)]
        ];
    }
}
