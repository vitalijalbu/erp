<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;

class StoreZipRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('zip');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];

        return [
            "description" => [
                'nullable', 
                'string', 
            ],
            "code" => [
                ...$required, 
                'string',
                $isNew ?
                    Rule::unique('zips')->where(
                        fn (Builder $query) => $query
                            ->where('company_id', auth()->user()->IDcompany)
                            ->where('city_id', $this->city_id)
                    )
                    :
                    Rule::unique('zips')->where(
                        fn (Builder $query) => $query
                            ->where('company_id', auth()->user()->IDcompany)
                            ->where('city_id', $this->city_id ?? $this->route()->parameter('zip')->city_id)
                    )->ignore($this->route()->parameter('zip')->id, 'id'),
            ],
            "city_id" => [
                ...$required, 
                'string',
                Rule::exists('cities', 'id')->where(
                    fn (Builder $query) => $query
                        ->where('company_id', auth()->user()->IDcompany)
                )
            ],
        ];
    }
}
