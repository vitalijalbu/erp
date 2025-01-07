<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;
use App\Helpers\Utility;


class StoreAddressRequest extends FormRequest
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
            "apartment_unit" => [
                'sometimes',
                'nullable', 
                'string',
            ],
            "address" => [
                ...$required, 
                'string',
            ],
            "street_number" => [
                ...$required, 
                'string',
            ],
            "timezone" => [
                ...$required, 
                'string',
                Rule::in(array_keys(Utility::generateTimezones()))
            ],
            "nation_id" => [
                ...$required,
                'string',
                Rule::exists('App\Models\Nation', 'id')
            ],
            "province_id" => [
                'sometimes',
                'nullable',
                'string',
                Rule::exists('provinces', 'id')->where(
                    fn (Builder $query) => $query
                        ->where('company_id', auth()->user()->IDcompany)
                        ->where('nation_id', $this->nation_id ?? $this->route()->parameter('address')?->nation_id)
                )
            ],
            "city_id" => [
                ...$required,
                'string',
                Rule::exists('cities', 'id')->where(
                    fn (Builder $query) => $query
                        ->where('company_id', auth()->user()->IDcompany)
                        ->where('nation_id', $this->nation_id ?? $this->route()->parameter('address')?->nation_id)
                        ->when(
                            $this->province_id ?? $this->route()->parameter('address')?->province_id, 
                            fn (Builder $query, $provinceId) => $query
                                ->where('province_id', $provinceId)
                        )
                )
            ],
            "zip_id" => [
                ...$required,
                'string',
                Rule::exists('zips', 'id')->where(
                    fn (Builder $query) => $query
                        ->where('company_id', auth()->user()->IDcompany)
                        ->where('city_id', $this->city_id ?? $this->route()->parameter('address')?->city_id)
                )
            ],
        ];
    }
}
