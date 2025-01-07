<?php

namespace App\Http\Requests;

use App\Models\NaicsCode;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Database\Query\Builder;
use PrinsFrank\Standards\Language\LanguageAlpha2;

class StoreBPRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $isNew = !$this->route()->parameter('bp');
        $required = $isNew ? ['required'] : ['sometimes', 'required'];
        
        return [
            "desc" => [
                ...$required, 
                'string', 
                Rule::unique('App\Models\BP')
                    ->where('IDcompany', auth()->user()->IDcompany)
                    ->when(
                        $this->route()->parameter('bp'), 
                        function($rule, $bp) {
                            $rule
                                ->ignore($bp->IDbp, 'IDbp');
                        }
                    )
            ],
            "supplier" => [...$required, 'boolean'],
            "customer" => [...$required, 'boolean'],
            "address_id" => [
                'sometimes', 
                'nullable', 
                'string',
                Rule::exists('addresses', 'id')->where(
                    fn (Builder $query) => $query
                        ->where('company_id', auth()->user()->IDcompany)
                )
            ],
            "contact_id" => [
                'sometimes', 
                'nullable', 
                'string',
                Rule::exists('contacts', 'id')->where(
                    fn (Builder $query) => $query
                        ->where('company_id', auth()->user()->IDcompany)
                )
            ],
            'language' => [
                'sometimes', 
                'nullable',
                'string', 
                Rule::in(collect(LanguageAlpha2::cases())->pluck('value')->toArray())
            ],
            'business_registry_registration' => [
                'sometimes', 
                'nullable',
                'string', 
            ],
            'currency_id' => [
                ...$required,
                'string', 
                Rule::exists('currencies', 'id')
            ],
            'vat' => [
                ...$required,
                'string', 
            ],
            'bp_category_id' => [
                'required', 
                'string', 
                Rule::exists('bp_categories', 'id')
            ],
            'naics_l1' => [
                'sometimes',
                'nullable', 
                'required_with:naics_l2,naics_l3',
                'string', 
                Rule::exists(NaicsCode::class, 'id')->where(function(Builder $query) {
                    return $query->where('level', 1);
                })
            ],
            'naics_l2' => [
                'sometimes', 
                'nullable',
                'required_with:naics_l3',
                'string', 
                Rule::exists(NaicsCode::class, 'id')->where(function(Builder $query) {
                    return $query->where('level', 2)->where('parent_id', $this->naics_l1);
                })
            ],
            'naics_l3' => [
                'sometimes', 
                'nullable',
                'string', 
                Rule::exists(NaicsCode::class, 'id')->where(function(Builder $query) {
                    return $query->where('level', 3)->where('parent_id', $this->naics_l2);
                })
            ],

            "is_sales" => [...$required,  'boolean'],
            "is_shipping" => [...$required, 'boolean'],
            "is_invoice" => [...$required, 'boolean'],
            "is_purchase" => [...$required, 'boolean'],
            "is_blocked" => [...$required, 'boolean'],
            "is_carrier" => [...$required, 'boolean'],
            "sales_order_type_id" => ['sometimes', 'nullable', 'string', Rule::exists('order_types', 'id') ],
            'sales_address_id' => ['sometimes', 'nullable', 'string', Rule::exists('addresses', 'id')->where('company_id', auth()->user()->IDcompany)],
            'sales_contact_id' => ['sometimes', 'nullable', 'string', Rule::exists('contacts', 'id')->where('company_id', auth()->user()->IDcompany)],
            'sales_internal_contact_id' => ['sometimes', 'nullable', 'string', Rule::exists('contacts', 'id')->where('company_id', auth()->user()->IDcompany)->where('is_employee', 1)],
            'sales_external_contact_id' => ['sometimes', 'nullable', 'string', Rule::exists('contacts', 'id')->where('company_id', auth()->user()->IDcompany)->where('is_employee', 1)],
            'sales_document_language_id' => ['sometimes', 'nullable', 'string', Rule::exists('document_languages', 'id') ],
            'sales_currency_id' => ['sometimes', 'nullable', 'string', Rule::exists('currencies', 'id')],
            'sales_has_chiorino_stamp' => ['sometimes', 'boolean'],
            'shipping_carrier_id' => ['sometimes', 'nullable', 'string', Rule::exists('bp', 'IDbp')->where('IDcompany', auth()->user()->IDcompany)->where('is_carrier', 1)],
            'shipping_document_language_id' => ['sometimes', 'nullable', 'string', Rule::exists('document_languages', 'id')],
            'shipping_delivery_term_id' => ['sometimes', 'nullable', 'string', Rule::exists('delivery_terms', 'id')],
            'shipping_address_id' => ['sometimes', 'nullable', 'string', Rule::exists('addresses', 'id')->where('company_id', auth()->user()->IDcompany)],
            'shipping_contact_id' => ['sometimes', 'nullable', 'string', Rule::exists('contacts', 'id')->where('company_id', auth()->user()->IDcompany)],



            'invoice_address_id' => ['sometimes', 'nullable', 'string', Rule::exists('addresses', 'id')->where('company_id', auth()->user()->IDcompany)],
            'invoice_contact_id' => ['sometimes', 'nullable', 'string', Rule::exists('contacts', 'id')->where('company_id', auth()->user()->IDcompany)],
            'invoice_payment_term_id' => ['sometimes', 'nullable', 'string', Rule::exists('payment_terms', 'code')],
            'invoice_payment_method_id' => ['sometimes', 'nullable', 'string', Rule::exists('payment_methods', 'code')],
            'invoice_shipping_method_id' => ['sometimes', 'nullable', 'string', Rule::exists('invoice_shipping_methods', 'code')],
            'invoice_document_language_id' => ['sometimes', 'nullable', 'string', Rule::exists('document_languages', 'id')],

            'purchase_address_id' => ['sometimes', 'nullable', 'string', Rule::exists('addresses', 'id')->where('company_id', auth()->user()->IDcompany)],
            'purchase_contact_id' => ['sometimes', 'nullable', 'string', Rule::exists('contacts', 'id')->where('company_id', auth()->user()->IDcompany)],
            'purchase_currency_id' => ['sometimes', 'nullable', 'string', Rule::exists('currencies', 'id')],
            'purchase_payment_term_id' => ['sometimes', 'nullable', 'string', Rule::exists('payment_terms', 'code')],
            'purchase_payment_method_id' => ['sometimes', 'nullable', 'string', Rule::exists('payment_methods', 'code')],
            'purchase_document_language_id' => ['sometimes', 'nullable', 'string', Rule::exists('document_languages', 'id')],

            
            'contacts' => ['present', 'array', 'min:0'],
            'contacts.*.contact_id' => ['required', 'string', 'distinct', Rule::exists('contacts', 'id')->where('company_id', auth()->user()->IDcompany)],
            'contacts.*.quotation' => ['required', 'boolean'],
            'contacts.*.order_confirmation' => ['required', 'boolean'],
            'contacts.*.billing' => ['required', 'boolean'],
            'contacts.*.delivery_note' => ['required', 'boolean'],
            'addresses' => ['present', 'array', 'min:0'],
            'addresses.*.address_id' => ['required', 'string', 'distinct', Rule::exists('addresses', 'id')->where('company_id', auth()->user()->IDcompany)],
            'addresses.*.is_sales' => ['required', 'boolean'],
            'addresses.*.is_shipping' => ['required', 'boolean'],
            'addresses.*.is_invoice' => ['required', 'boolean'],
            'addresses.*.is_purchase' => ['required', 'boolean'],

            'bank_accounts' => ['present', 'array', 'min:0'],
            'bank_accounts.*.name' => ['required', 'string'],
            'bank_accounts.*.address_id' => ['required', 'string', Rule::exists('addresses', 'id')->where('company_id', auth()->user()->IDcompany)],
            'bank_accounts.*.swift_code' => ['required', 'string'],
            'bank_accounts.*.iban' => ['required', 'string', 'distinct'],
            'group_id' => ['sometimes', 'string', 'nullable', Rule::exists('bp_groups', 'id')->where('company_id', auth()->user()->IDcompany)]
        ];
    }
}







