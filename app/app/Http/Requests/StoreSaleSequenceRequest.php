<?php

namespace App\Http\Requests;

use App\Models\SaleSequence;
use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use PrinsFrank\Standards\Language\LanguageAlpha2;

class StoreSaleSequenceRequest extends FormRequest
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
        $isNew = !$this->route()->parameter('sequence');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            'name' => [
                ...$required, 
                'string', 
                $isNew ?
                    Rule::unique('sale_sequences')->where(
                        fn (Builder $query) => $query
                            ->where('company_id', auth()->user()->IDcompany)
                    )
                    :
                    Rule::unique('sale_sequences')->where(
                        fn (Builder $query) => $query
                            ->where('company_id', auth()->user()->IDcompany)
                    )->ignore($this->route()->parameter('sequence')->id, 'id'),
            ],
            'prefix' => [
                $isNew ? 'required' : 'prohibited', 
                'string', 
                Rule::unique('sale_sequences')->where(
                    fn (Builder $query) => $query
                        ->where('company_id', auth()->user()->IDcompany)
                ),
                'size:4',
            ],
            'quotation_default' => [
                ...$required,  
                'boolean', 
            ],
            'sale_default' => [
                ...$required,  
                'boolean', 
            ],
        ];
    }
}
