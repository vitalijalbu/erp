<?php

namespace App\Http\Requests;

use App\Models\BP;
use App\Models\Item;
use App\Enum\ItemType;
use App\Enum\SaleType;
use App\Enum\SaleState;
use Illuminate\Validation\Rule;
use App\Rules\CheckServiceItemFields;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
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
        $is_updating = $this->route('sale') ? true : false;
        
        $rules =  [
            'sale_type' => ['required', 'string', new Enum(SaleType::class)],
            'sale_sequence_id' => [$is_updating ? 'missing' : 'required', 'string', Rule::exists('sale_sequences', 'id')->where('company_id', auth()->user()->IDcompany), $is_updating ? function($attribute, $value, $fail){
                if($value != $this->route('sale')->getOriginal('sale_sequence_id')){
                    $fail("You cannot change sale sequence");
                }
            } : ''],
            'bp_id' => ['required', 'string', 
                Rule::exists('bp', 'IDbp')->where('IDcompany', auth()->user()->IDcompany),
                    function($attribute, $value, $fail){
                        $bp = BP::where('IDbp', $this->bp_id)->first();

                        if($bp->is_blocked){
                            $fail("The selected business partner is blocked");
                        }else if(!$bp->is_active){
                            $fail("The selected business partner is deactivated");
                        }else if (!$bp->is_sales){
                            $fail("The selected business partner does not accept sales");
                        }else if (!$bp->is_shipping){
                            $fail("The selected business partner does not accept shipping");
                        }else if (!$bp->customer){
                            $fail("The selected business partner is not a customer");
                        }
                    },
                    $is_updating ? function($attribute, $value, $fail){
                        if($value != $this->route('sale')->getOriginal('bp_id')){
                            $fail("You cannot change BP");
                        }
                    } : ''
            ],
            'currency_id' => ['required', 'string', Rule::exists('currencies', 'id'), 
                $is_updating ? function($attribute, $value, $fail){
                    if($value != $this->route('sale')->getOriginal('currency_id')){
                        $fail("You cannot change currency id");
                    }
                } : ''
            ]
        ];

        if($this->sale_type == SaleType::quotation->value){
            $required = ['present', 'nullable'];
        }else{
            $required = ['required'];
        }

        $rules += [
            'expires_at' => [$this->sale_type == SaleType::quotation->value ? 'required' : ['nullable'], 'date'],
            'order_type_id' => [...$required, 'string', Rule::exists('order_types', 'id')],
            'delivery_date' => [...$required, 'date'],
            'customer_order_ref' => ['present', 'nullable', 'string'],
            'order_ref_a' => ['present', 'nullable', 'string'],
            'order_ref_b' => ['present', 'nullable', 'string'],
            'order_ref_c' => ['present', 'nullable', 'string'],
            'destination_address_id' => [...$required, 'string', function($attribute, $value, $fail){
                $bp = 
                    BP::where('IDbp', $this->bp_id)
                        ->where('is_shipping', 1)
                        ->with('addresses', function($q){
                            $q->where('is_shipping', 1);
                        })->first();

                $addresses = collect($bp?->addresses->pluck('id'))->merge($bp?->shipping_address_id)->unique();
                
                if($addresses->isEmpty()){
                    $fail("The selected business partner does not have valid shipping addresses");
                }
                elseif(!in_array($value, $addresses->toArray())){
                    $fail("The selected shipping addresses in not valid");
                }
            }],
            'invoice_address_id' => [...$required, 'string', function($attribute, $value, $fail){
                $bp = 
                    BP::where('IDbp', $this->bp_id)
                        //->where('is_invoice', 1)
                        ->with('addresses', function($q){
                            $q->where('is_invoice', 1);
                        })->first();
                        
                $addresses = collect($bp?->addresses->pluck('id'))->merge($bp?->invoice_address_id)->unique();
                
                if($addresses->isEmpty()){
                    $fail("The selected business partner does not have valid invoice addresses");
                }
                elseif(!in_array($value, $addresses->toArray())){
                    $fail("The selected invoice addresses in not valid");
                }
            }],
            'payment_term_code' => [...$required, 'string', Rule::exists('payment_terms', 'code')],
            'payment_method_code' => [...$required, 'string', Rule::exists('payment_methods', 'code')],  
            'sales_internal_contact_id' => [...$required, 'string', Rule::exists('contacts', 'id')->where('company_id', auth()->user()->IDcompany)->where('is_employee', 1)],
            'sales_external_contact_id' => [...$required, 'string', Rule::exists('contacts', 'id')->where('company_id', auth()->user()->IDcompany)->where('is_employee', 1)],
            'carrier_id' => [...$required, 'string', Rule::exists('bp', 'IDbp')->where('IDcompany', auth()->user()->IDcompany)->where('is_carrier', 1)],
            'delivery_term_id' => [...$required, 'string', Rule::exists('delivery_terms', 'id')],


            'sale_rows' => ['sometimes', 'array'],
            'sale_rows.*.position' => ['required', 'integer', 'gt:0', 'distinct'],
            'sale_rows.*.item_id' => ['required_if:sale_rows.*.standard_product_id,null', 'string', 'nullable', function($attribute, $value, $fail){
                $item = 
                    Item::whereIn('IDcompany', [0, auth()->user()->IDcompany])
                        ->whereHas('itemEnabledCompany')
                        ->where('IDitem', $value)
                        ->first();

                if(!$item){
                    return $fail('The selected item is not allowed');
                }
            }],
            'sale_rows.*.standard_product_id' => [
                'required_if:sale_rows.*.item_id, null', 
                'string', 
                'nullable', 
                Rule::exists('standard_products', 'id')
                    ->where('company_id', auth()->user()->IDcompany)
            ],
            'sale_rows.*.configuration' => [
                'required_with:sale_rows.*.standard_product_id', 
                'prohibits:sale_rows.*.item_id', 
                'nullable', 
                'array'
            ],
            'sale_rows.*.lot_id' => [ 
                'prohibits:sale_rows.*.standard_product_id', 
                'nullable', 
                'string', 
                Rule::exists('lot', 'IDlot')
                    ->where('IDcompany', auth()->user()->IDcompany)
            ],
            'sale_rows.*.quantity' => ['required', 'numeric', 'gt:0'],
            'sale_rows.*.delivery_date' => ['present', 'nullable', 'date', new CheckServiceItemFields],
            'sale_rows.*.order_type_id' => [...$required, 'string', Rule::exists('order_types', 'id')],
            // 'sale_rows.*.state' => ['required', 'string', Rule::in(collect(Salesale_rowstate::cases())->pluck('name')->toArray())],
            'sale_rows.*.customer_order_ref' => ['present', 'nullable', 'string'],
            'sale_rows.*.order_ref_a' => ['present', 'nullable', 'string'],
            'sale_rows.*.order_ref_b' => ['present', 'nullable', 'string'],
            'sale_rows.*.order_ref_c' => ['present', 'nullable', 'string'],
            'sale_rows.*.destination_address_id' => ['nullable', 'string', new CheckServiceItemFields, function($attribute, $value, $fail){
                $bp = 
                    BP::where('IDbp', $this->bp_id)
                        ->where('is_shipping', 1)
                        ->with('addresses', function($q){
                            $q->where('is_shipping', 1);
                        })->first();

                $addresses = collect($bp?->addresses->pluck('id'))->merge($bp?->shipping_address_id)->unique();
                
                if($addresses->isEmpty()){
                    $fail("The selected business partner does not have valid shipping addresses");
                }
                elseif(!in_array($value, $addresses->toArray())){
                    $fail("The selected shipping addresses in not valid");
                }
            }],
            'sale_rows.*.delivery_term_id' => ['nullable', 'string', new CheckServiceItemFields, Rule::exists('delivery_terms', 'id')],
            'sale_rows.*.carrier_id' => ['nullable', 'string', new CheckServiceItemFields, Rule::exists('bp', 'IDbp')->where('IDcompany', auth()->user()->IDcompany)->where('is_carrier', 1)],
            'sale_rows.*.tax_code' => ['present', 'nullable', 'string'],
            'sale_rows.*.sale_note' => ['present', 'nullable', 'string'],
            'sale_rows.*.billing_note' => ['present', 'nullable', 'string'],
            'sale_rows.*.production_note' => ['present', 'nullable', 'string'],
            'sale_rows.*.shipping_note' => ['present', 'nullable', 'string'],
            'sale_rows.*.packaging_note' => ['present', 'nullable', 'string'],
            'sale_rows.*.override_total_discount' => [
                'present', 
                'nullable', 
                'decimal:0,2',
                'min:-100'
            ],
            'sale_rows.*.override_total_discount_note' => [
                'sometimes', 
                'nullable',
                'string',
            ],
            'sale_rows.*.workcenter_id' => ['required', 'string', Rule::exists('workcenters', 'id')->where('company_id', auth()->user()->IDcompany)],
            'sale_rows.*.force_price_processing' => ['sometimes', 'nullable', 'boolean']
        ];

        if($is_updating){
            $rules += [
                'sale_rows.*.id' => ['present', 'nullable', 'string', 
                    Rule::exists('sale_rows', 'id')
                        ->where('company_id', auth()->user()->IDcompany)
                        ->where('sale_id', $this->route('sale')->id)
                ]
            ];
        }else{
            $rules += [
                'sale_rows.*.id' => ['prohibited']
            ];
        }

        return $rules;
    }

    public function attributes()
    {
        return [
            'sale_rows.*.position' => 'position',
            'sale_rows.*.item_id' => 'item id',
            'sale_rows.*.standard_product_id' => 'standard product id',
            'sale_rows.*.configuration' => 'configuration',
            'sale_rows.*.lot_id' => 'lot id',
            'sale_rows.*.quantity' => 'quantity',
            'sale_rows.*.delivery_date' => 'delivery date',
            'sale_rows.*.order_type_id' => 'order type id',
            'sale_rows.*.customer_order_ref' => 'customer order ref',
            'sale_rows.*.order_ref_a' => 'order ref a',
            'sale_rows.*.order_ref_b' => 'order ref b',
            'sale_rows.*.order_ref_c' => 'order ref c',
            'sale_rows.*.destination_address_id' => 'destination address id',
            'sale_rows.*.delivery_term_id' => 'delivery term id',
            'sale_rows.*.carrier_id' => 'carrier id',
            'sale_rows.*.tax_code' => 'tax code',
            'sale_rows.*.sale_note' => 'sale note',
            'sale_rows.*.billing_note' => 'billing note',
            'sale_rows.*.production_note' => 'production note',
            'sale_rows.*.shipping_note' => 'shipping note',
            'sale_rows.*.packaging_note' => 'packaging note',
            'sale_rows.*.override_total_discount' => 'ovverride total discount',
            'sale_rows.*.override_total_discount_note' => 'ovverride total discount note',
            'sale_rows.*.workcenter_id' => 'workcenter id',
            'sale_rows.*.force_price_processing' => 'force price processing',
            'sale_rows.*.id' => 'id',
        ];
    }
}
