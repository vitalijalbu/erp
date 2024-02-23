<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;

class StoreCityRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('city');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];

        return [
            "name" => [
                ...$required, 
                'string',
                $isNew ?
                    Rule::unique('cities')->where(
                        fn (Builder $query) => $query
                            ->where('company_id', auth()->user()->IDcompany)
                    )
                    :
                    Rule::unique('cities')->where(
                        fn (Builder $query) => $query
                            ->where('company_id', auth()->user()->IDcompany)
                    )->ignore($this->route()->parameter('city')->id, 'id'),
            ],
            "province_id" => [
                'sometimes',
                'nullable', 
                'string',
                Rule::exists('provinces', 'id')->where(
                    fn (Builder $query) => $query
                        ->where('company_id', auth()->user()->IDcompany)
                        ->where('nation_id', $this->nation_id ?? $this->route()->parameter('city')->nation_id)
                )
            ],
            "nation_id" => [
                ...$required,
                'string',
                Rule::exists('App\Models\Nation', 'id')
            ],
        ];
    }
}
