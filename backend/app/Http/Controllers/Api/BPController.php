<?php

namespace App\Http\Controllers\Api;

use App\DataTables\AddressesDataTable;
use App\DataTables\ContactDataTable;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\StoreBPContactRequest;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use App\Models\BP;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\StoreBPRequest;
use App\Models\Address;
use App\Models\BPCategory;
use App\Models\Contact;
use App\Models\NaicsCode;
use Illuminate\Database\Eloquent\Builder;

class BPController extends ApiController
{

    public function __construct()
    {
        $this->authorizeResource(BP::class, 'bp');
    }

    /**
     * @OA\Get(
     *   tags={"BP", "masterdata_business_partner.php"},
     *   path="/bp",
     *   summary="BP list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/BPResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new \App\DataTables\BPDataTable(
            BP::byUser(auth()->user())
                ->withCount(['bpDestinations'])
                ->with(['address', 'mainContact'])
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"BP", "masterdata_business_partner.php"},
     *   path="/bp",
     *   summary="Create new BP",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "desc", "supplier", "customer", "currency", "vat"
     *       },
     *       @OA\Property(property="desc", type="string"),
     *       @OA\Property(property="supplier", type="boolean"),
     *       @OA\Property(property="customer", type="boolean"),
     *       @OA\Property(property="address_id", type="string"),
     *       @OA\Property(property="contact_id", type="string"),
     *       @OA\Property(property="business_registry_registration", type="string"),
     *       @OA\Property(property="currency_id", type="string"),
     *       @OA\Property(property="vat", type="string"),
     *       @OA\Property(property="language", type="string"),
     *       @OA\Property(property="contacts", type="array"),
     *       example={
     *          "desc": "Nome BP",
     *          "group_id" : "",
     *          "supplier": 1,
     *          "customer": 0,
     *          "address_id": "845-10",
     *          "contact_id": "845-11",
     *          "business_registry_registration": "12545-65-566",
     *          "currency_id": "USD",
     *          "vat": "0124564897",
     *          "language": "it",
     *          "bp_category_id" : "D",
     *          "is_sales" : 1,
     *          "is_shipping" : 0,
     *          "is_invoice" : 0,
     *          "is_purchase" : 0,
     *          "is_carrier" : 0,
     *          "is_blocked" : 0,
     *          "is_active" : 1,
     *          "naics_l1" : "",
     *          "naics_l2" : "",
     *          "naics_l3" : "",
     *          "sales_currency_id" : "",
     *          "sales_internal_contact_id" : "",
     *          "sales_external_contact_id" : "",
     *          "sales_document_language_id" : "",
     *          "sales_address_id" : "",
     *          "sales_contact_id" : "",
     *          "sales_has_chiorino_stamp" : "",
     *          "sales_order_type_id" : "",
     *          "shipping_carrier_id" : "",
     *          "shipping_document_language_id" : "",
     *          "shipping_delivery_term_id" : "",
     *          "shipping_address_id" : "",
     *          "shipping_contact_id" : "",
     *          "invoice_address_id" : "",
     *          "invoice_contact_id" : "",
     *          "invoice_payment_term_id" : "",
     *          "invoice_payment_method_id" : "",
     *          "invoice_shipping_method_id" : "",
     *          "invoice_document_language_id" : "",
     *          "purchase_address_id" : "",
     *          "purchase_contact_id" : "",
     *          "purchase_currency_id" : "",
     *          "purchase_payment_term_id" : "",
     *          "purchase_payment_method_id" : "",
     *          "purchase_document_language_id" : "",
     *          "contacts" : {
     *              {
     *                  "contact_id": "845-53",
     *                  "quotation": 1,
     *                  "order_confirmation": 0,
     *                  "billing": 0,
     *                  "delivery_note": 1
     *              }
     *          },
      *          "addresses" : {{
     *              "address_id" : "845-8",
     *              "is_sales" : 0,
     *              "is_shipping" : 1,
     *              "is_invoice" : 1,
     *              "is_purchase" : 0
     *          },
     *          {
     *              "address_id" : "845-10",
     *              "is_sales" : 0,
     *              "is_shipping" : 1,
     *              "is_invoice" : 1,
     *              "is_purchase" : 0
     *          }},
     *          "bank_accounts" : {{
     *              "name" : "Bank 1",
     *              "address_id" : "845-10",
     *              "swift_code" : "45fd3",
     *              "iban" : "ITxxxxxx",
     *          },
     *          {
     *             "name" : "Bank 2",
     *              "address_id" : "845-12",
     *              "swift_code" : "jgk45",
     *              "iban" : "DExxxxxx",
     *          }}
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/BPResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreBPRequest $request)
    {
        $bp = new BP();

        $remove = [];

        if(!$request->is_sales){
            $remove = array_merge($remove, [
                'naics_l1',
                'naics_l2',
                'naics_l3',
                'sales_currency_id',
                'sales_internal_contact_id',
                'sales_external_contact_id',
                'sales_document_language_id',
                'sales_address_id',
                'sales_contact_id',
                'sales_has_chiorino_stamp',
                'sales_order_type_id',
                
            ]);
        }

        if(!$request->is_shipping){
            $remove = array_merge($remove, [
                'shipping_carrier_id',
                'shipping_document_language_id',
                'shipping_delivery_term_id',
                'shipping_address_id',
                'shipping_contact_id',
            ]);
        }

        if(!$request->is_invoice){
            $remove = array_merge($remove, [
                'invoice_address_id',
                'invoice_contact_id',
                'invoice_payment_term_id',
                'invoice_payment_method_id',
                'invoice_shipping_method_id',
                'invoice_document_language_id',
            ]);
        }

        if(!$request->is_purchase){
            $remove = array_merge($remove, [
                'purchase_address_id',
                'purchase_contact_id',
                'purchase_currency_id',
                'purchase_payment_term_id',
                'purchase_payment_method_id',
                'purchase_document_language_id',
            ]);
        }

        if(auth()->user()->cannot('bp.block')){
            $remove = array_merge($remove, [
                'is_blocked'
            ]);
        }

        $bp->fill($request->except($remove));
        $bp->IDcompany = auth()->user()->IDcompany;

        DB::transaction(function() use ($bp, $request) {
            abort_if(!$bp->save(), 500);

            $bp->contacts()->sync(
                collect($request->contacts)->keyBy('contact_id')->map(function($el){
                    unset($el['contact_id']);
                    $el['company_id'] = auth()->user()->IDcompany;
                    return $el;
                })->toArray()
            );

            $bp->addresses()->sync(
                collect($request->addresses)->keyBy('address_id')->map(function($el){
                    unset($el['address_id']);
                    $el['company_id'] = auth()->user()->IDcompany;
                    return $el;
                })->toArray()
            );

            foreach($request->bank_accounts as $bank){
                BankAccount::updateOrCreate([
                    'iban' => $bank['iban'],
                    'bp_id' => $bp->IDbp,
                    'company_id' => auth()->user()->IDcompany
                ], $bank);
            }
        });

        return $this->show($bp);
    }

    /**
     * @OA\Get(
     *   tags={"BP", "masterdata_business_partner.php"},
     *   path="/bp/{id}",
     *   summary="BP show",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/BPResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(BP $bp)
    {
        $bp->loadMissing([
                'bpDestinations', 
                'address', 
                'mainContact', 
                'contacts' => fn ($query) => $query->with('address'),
                'addresses',
                'bankAccounts' => fn($q) => $q->with('address')
            ])
            ->append('last_modification')
            ->append('creation');

        return response()->json($bp);
    }

    /**
     * @OA\Put(
     *   tags={"BP", "masterdata_business_partner.php"},
     *   path="/bp/{id}",
     *   summary="Update BP",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={},
     *       @OA\Property(property="desc", type="string"),
     *       @OA\Property(property="supplier", type="boolean"),
     *       @OA\Property(property="customer", type="boolean"),
     *       @OA\Property(property="address_id", type="string"),
     *       @OA\Property(property="contact_id", type="string"),
     *       @OA\Property(property="business_registry_registration", type="string"),
     *       @OA\Property(property="currency_id", type="string"),
     *       @OA\Property(property="vat", type="string"),
     *       @OA\Property(property="language", type="string"),
     *       @OA\Property(property="contacts", type="array"),
     *       example={
     *          "desc": "Nome BP",
     *          "group_id" : "",
     *          "supplier": 1,
     *          "customer": 0,
     *          "address_id": "845-10",
     *          "contact_id": "845-11",
     *          "business_registry_registration": "12545-65-566",
     *          "currency_id": "USD",
     *          "vat": "0124564897",
     *          "language": "it",
     *          "bp_category_id" : "D",
     *          "is_sales" : 1,
     *          "is_shipping" : 0,
     *          "is_invoice" : 0,
     *          "is_purchase" : 0,
     *          "is_carrier" : 0,
     *          "is_blocked" : 0,
     *          "is_active" : 1,
     *          "naics_l1" : "",
     *          "naics_l2" : "",
     *          "naics_l3" : "",
     *          "sales_currency_id" : "",
     *          "sales_internal_contact_id" : "",
     *          "sales_external_contact_id" : "",
     *          "sales_document_language_id" : "",
     *          "sales_address_id" : "",
     *          "sales_contact_id" : "",
     *          "sales_has_chiorino_stamp" : "",
     *          "sales_order_type_id" : "",
    *          "shipping_carrier_id" : "",
     *          "shipping_document_language_id" : "",
     *          "shipping_delivery_term_id" : "",
     *          "shipping_address_id" : "",
     *          "shipping_contact_id" : "",
     *          "invoice_address_id" : "",
     *          "invoice_contact_id" : "",
     *          "invoice_payment_term_id" : "",
     *          "invoice_payment_method_id" : "",
     *          "invoice_shipping_method_id" : "",
     *          "invoice_document_language_id" : "",
     *          "purchase_address_id" : "",
     *          "purchase_contact_id" : "",
     *          "purchase_currency_id" : "",
     *          "purchase_payment_term_id" : "",
     *          "purchase_payment_method_id" : "",
     *          "purchase_document_language_id" : "",
     *          "contacts" : {
     *              {
     *                  "contact_id": "845-53",
     *                  "quotation": 1,
     *                  "order_confirmation": 0,
     *                  "billing": 0,
     *                  "delivery_note": 1
     *              }
     *          },
     *          "addresses" : {{
     *              "address_id" : "845-8",
     *              "is_sales" : 0,
     *              "is_shipping" : 1,
     *              "is_invoice" : 1,
     *              "is_purchase" : 0
     *          },
     *          {
     *              "address_id" : "845-10",
     *              "is_sales" : 0,
     *              "is_shipping" : 1,
     *              "is_invoice" : 1,
     *              "is_purchase" : 0
     *          }},
     *          "bank_accounts" : {{
     *              "name" : "Bank 1",
     *              "address_id" : "845-10",
     *              "swift_code" : "45fd3",
     *              "iban" : "ITxxxxxx",
     *          },
     *          {
     *             "name" : "Bank 2",
     *              "address_id" : "845-12",
     *              "swift_code" : "jgk45",
     *              "iban" : "DExxxxxx",
     *          }}
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/BPResource")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreBPRequest $request, BP $bp)
    {
        $remove = [];

        if(!$request->is_sales){
            $remove = array_merge($remove, [
                'naics_l1',
                'naics_l2',
                'naics_l3',
                'sales_currency_id',
                'sales_internal_contact_id',
                'sales_external_contact_id',
                'sales_document_language_id',
                'sales_address_id',
                'sales_contact_id',
                'sales_has_chiorino_stamp',
                'sales_order_type_id',
                
            ]);
        }

        if(!$request->is_shipping){
            $remove = array_merge($remove, [
                'shipping_carrier_id',
                'shipping_document_language_id',
                'shipping_delivery_term_id',
                'shipping_address_id',
                'shipping_contact_id',
            ]);
        }

        if(!$request->is_invoice){
            $remove = array_merge($remove, [
                'invoice_address_id',
                'invoice_contact_id',
                'invoice_payment_term_id',
                'invoice_payment_method_id',
                'invoice_shipping_method_id',
                'invoice_document_language_id',
            ]);
        }

        if(!$request->is_purchase){
            $remove = array_merge($remove, [
                'purchase_address_id',
                'purchase_contact_id',
                'purchase_currency_id',
                'purchase_payment_term_id',
                'purchase_payment_method_id',
                'purchase_document_language_id',
            ]);
        }

        if(auth()->user()->cannot('bp.block')){
            $remove = array_merge($remove, [
                'is_blocked'
            ]);
        }

        $bp->fill($request->except($remove));
        
        DB::transaction(function() use ($bp, $request) {
            abort_if(!$bp->save(), 500);

            $bp->contacts()->sync(
                collect($request->contacts)->keyBy('contact_id')->map(function($el){
                    unset($el['contact_id']);
                    $el['company_id'] = auth()->user()->IDcompany;
                    return $el;
                })->toArray()
            );

            $bp->addresses()->sync(
                collect($request->addresses)->keyBy('address_id')->map(function($el){
                    unset($el['address_id']);
                    $el['company_id'] = auth()->user()->IDcompany;
                    return $el;
                })->toArray()
            );

            BankAccount::where('company_id', auth()->user()->IDcompany)
                ->where('bp_id', $bp->IDbp)
                ->whereNotIn('iban', collect($request->bank_accounts)->pluck('iban')->toArray())
                ->delete();

            foreach($request->bank_accounts as $bank){
                BankAccount::updateOrCreate([
                    'iban' => $bank['iban'],
                    'bp_id' => $bp->IDbp,
                    'company_id' => auth()->user()->IDcompany
                ], $bank);
            }

            activity()->performedOn($bp)->log('updated');
        });
    }

    /**
     * @OA\Delete(
     *   tags={"BP","masterdata_business_partner.php"},
     *   path="/bp/{id}",
     *   summary="Delete BP",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/BP")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function destroy(BP $bp)
    {
        $deleted = DB::transaction(function() use ($bp) {
            return $bp->delete();
        });

        if(!$deleted) {
            abort(500);
        }
    }

    /**
     * @OA\Get(
     *   tags={"BP", },
     *   path="/bp/naics",
     *   summary="Get available naics code",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/NaicsCodeResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function naicsCodes()
    {
        $datatable = new \App\DataTables\NaicsCodesDataTable(
            NaicsCode::query()
        );
        return $datatable->toJson();
    }

    /**
     * @OA\Get(
     *   tags={"BP"},
     *   path="/bp/categories",
     *   summary="Get available BP categories",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/BPCategoryResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function categories()
    {
        $categories = BPCategory::orderBy('description')->get();

        return response()->json($categories);
    }

    /**
     * @OA\Get(
     *   tags={"BP"},
     *   path="/bp/{id}/shipping-address",
     *   summary="Get available BP shipping addresses",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/AddressResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function shippingAddresses(Request $request, BP $bp)
    {
        $addresses = Address::whereHas('bp', function(Builder $q) use ($bp) {
            $q->where('bp.IDbp', $bp->IDbp)
                ->where('bp_addresses.is_shipping', true);
        })
        ->when($bp->shipping_address_id, function(Builder $query) use ($bp) {
            $query->orWhere('addresses.id', $bp->shipping_address_id);
        });

        $datatable = new AddressesDataTable($addresses);

        return $datatable->toJson();
    }


    /**
     * @OA\Get(
     *   tags={"BP"},
     *   path="/bp/{id}/invoice-address",
     *   summary="Get available BP invoice addresses",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/AddressResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function invoiceAddresses(Request $request, BP $bp)
    {
        $addresses = Address::whereHas('bp', function(Builder $q) use ($bp) {
            $q->where('bp.IDbp', $bp->IDbp)
                ->where('bp_addresses.is_invoice', true);
        })
        ->when($bp->invoice_address_id, function(Builder $query) use ($bp) {
            $query->orWhere('addresses.id', $bp->invoice_address_id);
        });

        $datatable = new AddressesDataTable($addresses);

        return $datatable->toJson();
    }

    /**
     * @OA\Get(
     *   tags={"BP"},
     *   path="/bp/{id}/addresses/{type}",
     *   summary="Get available BP addresses by type",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/type", description="sales|purchase|invoice|shipping"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/AddressResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function typedAddresses(Request $request, BP $bp, $type)
    {
        switch($type) {
            case 'sales':
                $addressField = 'is_sales';
                $bpField = 'sales_address_id';
                break;
            case 'purchase':
                $addressField = 'is_purchase';
                $bpField = 'purchase_address_id';
                break;
            case 'invoice':
                $addressField = 'is_invoice';
                $bpField = 'invoice_address_id';
                break;
            case 'shipping':
                $addressField = 'is_shipping';
                $bpField = 'shipping_address_id';
                break;
        }
        $addresses = Address::whereHas('bp', function(Builder $q) use ($bp, $addressField) {
            $q->where('bp.IDbp', $bp->IDbp)
                ->where('bp_addresses.'.$addressField, true);
        })
        ->when($bp->{$bpField}, function(Builder $query) use ($bp, $bpField) {
            $query->orWhere('addresses.id', $bp->{$bpField});
        });

        $datatable = new AddressesDataTable($addresses);

        return $datatable->toJson();
    }


    /**
     * @OA\Get(
     *   tags={"BP"},
     *   path="/bp/{id}/contacts/{type}",
     *   summary="Get available BP contacts by type",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Parameter(ref="#/components/parameters/type", description="quotation|order|billing|shipping"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/ContactResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function typedContacts(Request $request, BP $bp, $type)
    {
        switch($type) {
            case 'quotation':
                $contactField = 'quotation';
                break;
            case 'order':
                $contactField = 'order_confirmation';
                break;
            case 'billing':
                $contactField = 'billing';
                break;
            case 'shipping':
                $contactField = 'delivery_note';
                break;
        }
        $contacts = Contact::whereHas('bp', function(Builder $q) use ($bp, $contactField) {
            $q->where('bp.IDbp', $bp->IDbp)
                ->where('bp_contact.'.$contactField, true);
        });

        $datatable = new ContactDataTable($contacts);

        return $datatable->toJson();
    }
}
