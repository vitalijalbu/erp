<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;

class StoreProvinceRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('province');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];

        return [
            "name" => [
                ...$required, 
                'string', 
            ],
            "code" => [
                ...$required, 
                'string',
                $isNew ?
                    Rule::unique('provinces')->where(
                        fn (Builder $query) => $query
                            ->where('company_id', auth()->user()->IDcompany)
                            ->where('nation_id', $this->nation_id)
                    )
                    :
                    Rule::unique('provinces')->where(
                        fn (Builder $query) => $query
                            ->where('company_id', auth()->user()->IDcompany)
                            ->where('nation_id', $this->nation_id ?? $this->route()->parameter('province')->nation_id)
                    )->ignore($this->route()->parameter('province')->id, 'id'),
            ],
            "nation_id" => [
                ...$required,
                'string',
                Rule::exists('App\Models\Nation', 'id')
            ],
        ];
    }
}
