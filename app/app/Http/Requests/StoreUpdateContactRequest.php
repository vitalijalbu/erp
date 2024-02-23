<?php

namespace App\Http\Requests;

use App\Models\Contact;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use PrinsFrank\Standards\Language\LanguageAlpha2;

class StoreUpdateContactRequest extends FormRequest
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
            'name' => ['required', 'string'],
            'type' => ['required', 'string', Rule::in(array_keys(Contact::getAvailableTypes()))],
            'note' => ['sometimes', 'nullable', 'string'],
            'is_employee' => ['required', 'boolean'],
            'department' => ['present', 'nullable', 'string', 'max:100'],
            'address_id' => ['present', 'nullable', Rule::exists('addresses', 'id')->where('company_id', auth()->user()->IDcompany)],
            'contact_type_id' => ['present', 'nullable', Rule::exists('contact_types', 'id')],
            'office_phone' => ['present', 'nullable', 'string', 'max:100'],
            'mobile_phone' => ['nullable', 'string', 'max:100'],
            'email' => ['present', 'nullable', 'email:filter', 'max:100'],
            'language' => ['required', Rule::in(collect(LanguageAlpha2::cases())->pluck('value')->toArray())]
        ];
    }
}
