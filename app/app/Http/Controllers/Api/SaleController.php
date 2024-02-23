<?php

namespace App\Http\Controllers\Api;

use App\Configurator\Exception\ConfiguratorException;
use App\Models\Item;
use App\Models\Sale;
use App\Enum\SaleType;
use App\Enum\SaleState;
use App\Models\SaleRow;
use Illuminate\Http\Request;
use App\Models\StandardProduct;
use Barryvdh\DomPDF\Facade\Pdf;
use App\DataTables\SaleDataTable;
use App\Enum\SaleRowState;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveDiscountRequest;
use App\Http\Requests\ChangeSaleRowStateRequest;
use Illuminate\Support\Facades\Http;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\StoreSaleRowRequest;
use App\Http\Requests\ChangeSaleStateRequest;
use App\Http\Requests\ConvertQuotationToSaleRequest;
use App\Http\Requests\SaleRowPricePreviewRequest;
use App\Http\Requests\SendSalePDFRequest;
use App\Mail\SalePDF;
use App\Models\Contact;
use Illuminate\Support\Facades\Mail;
use Spatie\Browsershot\Browsershot;

class SaleController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Sale::class, 'sale');
    }

    /** 
     * @OA\Get(
     *   tags={"Sales"},
     *   path="/sales",
     *   summary="Get list of quotations and sales",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *       ),
     *     )
     *   )
     * )
     */
    public function index(Request $request)
    {
        abort_if(empty($request->columns['sale_type']['search']['value']), 400, "You have to filter by sale type");
        
        abort_if(!in_array($request->columns['sale_type']['search']['value'], collect(SaleType::cases())->pluck('name')->toArray()), 400, "Invalid sale type");
  
        $query = 
            Sale::query()
                ->where('sales.company_id', auth()->user()->IDcompany)
                ->with('bp')
                ->with('internalContact');

        $datatable = new SaleDataTable($query);

        if(!$request->has('order')) {
            $datatable->order(function($query) {
                $query->orderBy('created_at', 'desc');
            });
        }

        return $datatable->toJson();
        
    }

    /**
     * @OA\POST(
     *   tags={"Sales"},
     *   path="/sales",
     *   summary="Create new offer or order",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "sale_type", "sale_sequence_id", "currency_id", "bp_id"
     *       },
     *       @OA\Property(property="sale_type", type="string"),
     *       @OA\Property(property="sale_sequence_id", type="string"),
     *       @OA\Property(property="currency_id", type="string"),
     *       @OA\Property(property="bp_id", type="string"),
     *       example={
     *          "sale_type": "quotation",
     *          "sale_sequence_id": "845-10",
     *          "bp_id": "845-3107",
     *          "currency_id": "EUR",
     *          "order_type_id": "",
     *          "delivery_date": "",
     *          "customer_order_ref": "",
     *          "order_ref_a": "",
     *          "order_ref_b": "",
     *          "order_ref_c": "",
     *          "destination_address_id": "",
     *          "invoice_address_id": "",
     *          "payment_term_code": "",
     *          "payment_method_code": "",
     *          "sales_internal_contact_id": "",
     *          "sales_external_contact_id": "",
     *          "carrier_id": "",
     *          "delivery_term_id": "",
     *          "expires_at" : "",
     *          "sale_rows" : {
     *              {
     *                  "position" : 10,
     *                  "item_id" : "845-10",
     *                  "standard_product_id" : "",
     *                  "configuration" : "",
     *                  "quantity": 10,
     *                  "order_type_id" : "",
     *                  "customer_order_ref" : "",
     *                  "order_ref_a" : "",   
     *                  "order_ref_b" : "",   
     *                  "order_ref_c" : "",
     *                  "destination_address_id" : "",
     *                  "delivery_term_id" : "",
     *                  "carrier_id" : "",
     *                  "tax_code" : "",
     *                  "lot_id" : "",
     *                  "delivery_date" :"2023-01-10",
     *                  "sale_note" : "",
     *                  "billing_note" : "",
     *                  "production_note" : "",
     *                  "shipping_note" : "",
     *                  "packaging_note" : "",
     *                  "workcenter_id" : "845-1"
     *              },
     *              {
     *                  "position" : 13,
     *                  "item_id" : "845-22",
     *                  "standard_product_id" : "",
     *                  "configuration" : "",
     *                  "quantity": 10,
     *                  "order_type_id" : "",
     *                  "customer_order_ref" : "",
     *                  "order_ref_a" : "",   
     *                  "order_ref_b" : "",   
     *                  "order_ref_c" : "",
     *                  "destination_address_id" : "",
     *                  "delivery_term_id" : "",
     *                  "carrier_id" : "",
     *                  "tax_code" : "",
     *                  "lot_id" : "",
     *                  "delivery_date": "2023-10-25",
     *                  "sale_note" : "",
     *                  "billing_note" : "",
     *                  "production_note" : "",
     *                  "shipping_note" : "",
     *                  "packaging_note" : "",
     *                  "workcenter_id" : "845-1"
     *              }              
     *          }
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function store(StoreSaleRequest $request)
    {
        $sale = DB::transaction(function() use ($request){
            $sale = new Sale();
            $sale->fill($request->validated());
            $sale->company_id = auth()->user()->IDcompany;
            $sale->created_at = now()->format('Y-m-d H:i:s');
            $sale->timezone = auth()->user()->clientTimezoneDB;
            $sale->state = SaleState::inserted;
            $sale->company_currency_id = auth()->user()->company->curr;

            if($request->sale_type == SaleType::sale->value){
                $sale->expires_at = null;
            }

            if(!$sale->save()){
                abort(500);
            }

            try {
                $rows = collect($request->sale_rows)->map(function($row) use ($request) {
                    $row = SaleRow::buildFromSaleRowData(
                        $row,
                        auth()->user(),
                        $request->bp_id
                    );

                    return $row;
                });
                if(auth()->user()->can('approveDiscountOverride', $sale)) {
                    $rows->each(function ($row, $key) {
                        $row->totalDiscountAutoApproval(true);
                    });
                }
            }
            catch(ConfiguratorException $e) {
                abort(500, $e->getMessage());
            }
            
            $sale->saleRows()->saveMany($rows);

            return $sale;
        });
        
        return $this->show($sale);
    }


    /**
     * @OA\POST(
     *   tags={"Sales"},
     *   path="/sales/{id}/row",
     *   summary="Create or update sale row",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="position", type="string"),
     *      @OA\Property(property="item_id", type="string"),
     *      @OA\Property(property="standard_product_id", type="string"),
     *      @OA\Property(property="configuration", type="object"),
     *      @OA\Property(property="quantity", type="string"),
     *      @OA\Property(property="order_type_id", type="string"),
     *      @OA\Property(property="customer_order_ref", type="string"),
     *      @OA\Property(property="order_ref_a", type="string"),
     *      @OA\Property(property="order_ref_b", type="string"),
     *      @OA\Property(property="order_ref_c", type="string"),
     *      @OA\Property(property="destination_address_id", type="string"),
     *      @OA\Property(property="delivery_term_id", type="string"),
     *      @OA\Property(property="carrier_id", type="string"),
     *      @OA\Property(property="tax_code", type="string"),
     *      @OA\Property(property="lot_id", type="string"),
     *      @OA\Property(property="delivery_date", type="string"),
     *      @OA\Property(property="sale_note", type="string"),
     *      @OA\Property(property="billing_note", type="string"),
     *      @OA\Property(property="production_note", type="string"),
     *      @OA\Property(property="shipping_note", type="string"),
     *      @OA\Property(property="packaging_note", type="string"),
     *      @OA\Property(property="workcenter_id", type="string"),
     *       example={
     *           "id": null,
     *           "position" : 10,
     *           "item_id" : "845-10",
     *           "standard_product_id" : "",
     *           "configuration" : "",
     *           "quantity": 10,
     *           "order_type_id" : "",
     *           "customer_order_ref" : "",
     *           "order_ref_a" : "",   
     *           "order_ref_b" : "",   
     *           "order_ref_c" : "",
     *           "destination_address_id" : "",
     *           "delivery_term_id" : "",
     *           "carrier_id" : "",
     *           "tax_code" : "",
     *           "lot_id" : "",
     *           "delivery_date" :"2023-01-10",
     *           "sale_note" : "",
     *           "billing_note" : "",
     *           "production_note" : "",
     *           "shipping_note" : "",
     *           "packaging_note" : "",
     *           "workcenter_id" : "845-1"
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function storeRow(StoreSaleRowRequest $request, Sale $sale)
    {
        $row = DB::transaction(function() use ($request, $sale){
            $totalDiscountAutoApproval = auth()->user()->can('approveDiscountOverride', $sale);
            if(!$request->safe()->id){
                $row = SaleRow::buildFromSaleRowData(
                    $request->validated(),
                    auth()->user(),
                    $sale->bp_id
                );
                $row->totalDiscountAutoApproval($totalDiscountAutoApproval);
                $sale->saleRows()->save($row);
            }
            else {
                $row = SaleRow::updateFromSaleRowData(
                    $request->validated(),
                    auth()->user(),
                    $sale->bp_id
                );
                $row->totalDiscountAutoApproval($totalDiscountAutoApproval);
                $row->save();
            }
            
            $row->refresh();
            $row->loadMissing([
                'carrier',
                'item',
                'deliveryTerm',
                'orderType',
                'destinationAddress',
                'workcenter',
                'salePriceComponents.item',
                'salePriceComponents.process',
                'salePriceComponents.salePriceList',
                'salePriceComponents.saleDiscountMatrix',
                'saleRoutingCostComponents.item',
                'saleRoutingCostComponents.process',
                'saleRoutingCostComponents.salePriceList',
                'saleRoutingCostComponents.saleDiscountMatrix',
                'saleTotalDiscountMatrixRow'
            ]);

            return $row;
        });
        
        return response()->json($row);
    }

    /**
     * @OA\Get(
     *   tags={"Sales"},
     *   path="/sales/autocomplete",
     *   summary="Search items and std products for autocomplete",
     *   @OA\Parameter(
     *     name="search",
     *     in="query",
     *     required=true,
     *     type="string"
     *   ),
     *   @OA\Parameter(
     *     name="type",
     *     in="query",
     *     required=true,
     *     type="string"
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *       ),
     *     )
     *   )
     * )
     */
    public function autocomplete(Request $request)
    {
        $this->authorize('viewAny', Item::class);
        $request->validate([
            'search' => ['sometimes', 'nullable', 'string'],
            'type' => ['sometimes', 'nullable', 'string', 'in:items,standard_products,all']
        ]);

        $result = [];
        $type = $request->get('type', 'all');
        if($type == 'all' || $type == 'items') {
            $items = Item::searchByDesc(
                $request->search,
                $request->boolean('enabled', true),
                auth()->user()
            );
            if(!$request->search) {
                $items->take(10);
            }
            $result['items'] = $items->get();
        }
        
        if($type == 'all' || $type == 'standard_products') {
            $stdProducts = StandardProduct::searchByDesc(
                $request->search,
                auth()->user()
            );
    
            if(!$request->search) {
                $stdProducts->take(10);
            }
            $result['standard_products'] = $stdProducts->get();
        }

        
        return response()->json($result);
    }

   /**
     * @OA\Get(
     *   tags={"Sales"},
     *   path="/sales/{id}",
     *   summary="Get datails of quotation or sale",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/SaleResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     * 
     * @OA\Get(
     *   tags={"Sales"},
     *   path="/sales/{id}/print",
     *   summary="Print quotation or sale",
     *   @OA\Parameter(ref="#/components/parameters/id"),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/SaleResource")
     *   ),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function show(Sale $sale, $print = null)
    {
        $sale->loadMissing([
            'bp',
            'bp.address',
            'carrier' => fn($q) => $q->select('desc', 'IDbp'),
            'currency',
            'deliveryTerm',
            'destinationAddress',
            'invoiceAddress',
            'orderType',
            'paymentMethod',
            'paymentTerm',
            'externalContact',
            'internalContact',
            'saleRows',
            'saleRows.carrier',
            'saleRows.item',
            'saleRows.deliveryTerm',
            'saleRows.orderType',
            'saleRows.destinationAddress',
            'saleRows.workcenter',
            'saleRows.salePriceComponents.item',
            'saleRows.salePriceComponents.process',
            'saleRows.salePriceComponents.salePriceList',
            'saleRows.salePriceComponents.saleDiscountMatrix',
            'saleRows.saleRoutingCostComponents.item',
            'saleRows.saleRoutingCostComponents.process',
            'saleRows.saleRoutingCostComponents.salePriceList',
            'saleRows.saleRoutingCostComponents.saleDiscountMatrix',
            'saleRows.saleTotalDiscountMatrixRow'
        ])
            ->append('last_modification')
            ->append('creation');

        if($print){
            
            $pdf = $sale->generateSalePdf();

            return response(
                $pdf,
                headers: [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline;filename="'.urlencode($sale->code).'.pdf"'
                ]);
        }

        $sale->append('available_state_transitions');
       
        $sale->saleRows->map(function($el){
            $el->append('available_state_transitions');
            $el->item
                ->append('configuration_details');
            return $el;
        });
        
        return response()->json($sale);
    }

     /**
     * @OA\PUT(
     *   tags={"Sales"},
     *   path="/sales/{id}",
     *   summary="Update offer or order",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "sale_type", "sale_sequence_id", "currency_id", "bp_id"
     *       },
     *       @OA\Property(property="sale_type", type="string"),
     *       @OA\Property(property="sale_sequence_id", type="string"),
     *       @OA\Property(property="currency_id", type="string"),
     *       @OA\Property(property="bp_id", type="string"),
     *       example={
     *          "sale_type": "quotation",
     *          "sale_sequence_id": "845-10",
     *          "bp_id": "845-3107",
     *          "currency_id": "EUR",
     *          "order_type_id": "",
     *          "delivery_date": "",
     *          "customer_order_ref": "",
     *          "order_ref_a": "",
     *          "order_ref_b": "",
     *          "order_ref_c": "",
     *          "destination_address_id": "",
     *          "invoice_address_id": "",
     *          "payment_term_code": "",
     *          "payment_method_code": "",
     *          "sales_internal_contact_id": "",
     *          "sales_external_contact_id": "",
     *          "carrier_id": "",
     *          "delivery_term_id": "",
     *          "expires_at" : "",
     *          "sale_rows" : {
     *              {
     *                  "id" : "",
     *                  "position" : 10,
     *                  "item_id" : "845-10",
     *                  "standard_product_id" : "",
     *                  "configuration" : "",
     *                  "quantity": 10,
     *                  "order_type_id" : "",
     *                  "customer_order_ref" : "",
     *                  "order_ref_a" : "",   
     *                  "order_ref_b" : "",   
     *                  "order_ref_c" : "",
     *                  "destination_address_id" : "",
     *                  "delivery_term_id" : "",
     *                  "carrier_id" : "",
     *                  "tax_code" : "",
     *                  "lot_id" : "",
     *                  "delivery_date" :"2023-01-10",
     *                  "sale_note" : "",
     *                  "billing_note" : "",
     *                  "production_note" : "",
     *                  "shipping_note" : "",
     *                  "packaging_note" : "",
     *                  "workcenter_id" : "845-1"
     *              },
     *              {
     *                  "id" : "845-50",
     *                  "position" : 13,
     *                  "item_id" : "845-22",
     *                  "standard_product_id" : "",
     *                  "configuration" : "",
     *                  "quantity": 10,
     *                  "order_type_id" : "",
     *                  "customer_order_ref" : "",
     *                  "order_ref_a" : "",   
     *                  "order_ref_b" : "",   
     *                  "order_ref_c" : "",
     *                  "destination_address_id" : "",
     *                  "delivery_term_id" : "",
     *                  "carrier_id" : "",
     *                  "tax_code" : "",
     *                  "lot_id" : "",
     *                  "delivery_date": "2023-10-25",
     *                  "sale_note" : "",
     *                  "billing_note" : "",
     *                  "production_note" : "",
     *                  "shipping_note" : "",
     *                  "packaging_note" : "",
     *                  "workcenter_id" : "845-1"
     *              }              
     *          }
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function update(StoreSaleRequest $request, Sale $sale)
    {
        $sale = DB::transaction(function() use ($request, $sale){
            $sale->mergeGuarded(['sale_type']);
            $sale->fill($request->validated());

            if($request->sale_type == SaleType::sale){
                $sale->expires_at = null;
            }

            if(!$sale->save()){
                abort(500);
            }

            $sale->saleRows()->whereNotIn('id', collect($request->sale_rows)->pluck('id')->filter()->toArray())->delete();

            try {
                $totalDiscountAutoApproval = auth()->user()->can('approveDiscountOverride', $sale);
                foreach($request->sale_rows as $row){
                    if(empty($row['id'])){
                        $row = SaleRow::buildFromSaleRowData(
                            $row,
                            auth()->user(),
                            $request->bp_id
                        );
                        $row->totalDiscountAutoApproval($totalDiscountAutoApproval);
                        $sale->saleRows()->save($row);
                    }
                    else {
                        $row = SaleRow::updateFromSaleRowData(
                            $row,
                            auth()->user(),
                            $request->bp_id
                        );
                        $row->totalDiscountAutoApproval($totalDiscountAutoApproval);
                        $row->save();
                    }
                }
            }
            catch(ConfiguratorException $e) {
                abort(500, $e->getMessage());
            }

            return $sale;
        });
        
        return $this->show($sale);
    }


    

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        //
    }

    /**
     * @OA\Get(
     *   tags={"Sales"},
     *   path="/sales/types",
     *   summary="Get list of available sale types",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/Sale")
     *   ),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function types()
    {
        return response()->json(collect(SaleType::cases())->pluck('name'));
    }

    /**
     * @OA\POST(
     *   tags={"Sales"},
     *   path="/sales/{id}/change-state",
     *   summary="Change the order status",
     *   @OA\Parameter(
     *     name="id",
     *     required=true,
     *     type="string"
     *   ),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "state"
     *       },
     *       @OA\Property(property="state", type="string"),
     *       example={
     *          "state": "canceled",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function changeState(ChangeSaleStateRequest $request, Sale $sale)
    {
        abort_if($sale->is_blocked, 500, 'Cannot change state of a blocked order');
        abort_if($sale->sale_type == SaleType::quotation, 500, 'Cannot change state of a quotation');
        abort_if($sale->saleRows->isEmpty() && $request->state == SaleState::approved->value, 500, 'Cannot approve an order that contains no items');
        
        switch(SaleState::from($request->state)) {
            case SaleState::approved:
                $this->authorize('changeStateToApproved', $sale);
                abort_if($sale->hasDiscountOverrideToApprove(), 400, 'The order has some discount override to manage before it can be approved');
                break;
            case SaleState::canceled:
                $this->authorize('changeStateToCanceled', $sale);
                break;
            case SaleState::closed:
                $this->authorize('changeStateToClosed', $sale);
                break;
            default:
                $this->authorize('update', $sale);
        }

        abort_if(!$sale->canSetState($request->state), 500, sprintf('Cannot change the state of the order to "%s"', $request->state));

        $result = DB::transaction(function() use ($request, $sale) {
            $sale->state = SaleState::tryFrom($request->state);
            return $sale->save();
        });
        
        return response(null, $result ? 200 : 500);
    }


    /**
     * @OA\POST(
     *   tags={"Sales"},
     *   path="/sales/row/{id}/change-state",
     *   summary="Change the status of a row",
     *   @OA\Parameter(
     *     name="id",
     *     required=true,
     *     type="string"
     *   ),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "state"
     *       },
     *       @OA\Property(property="state", type="string"),
     *       example={
     *          "state": "canceled",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function changeRowState(ChangeSaleRowStateRequest $request, SaleRow $saleRow)
    {
        $this->authorize('update', $saleRow->sale);

        abort_if($saleRow->sale->is_blocked, 500, 'Cannot change the row state of a blocked order');
        abort_if($saleRow->sale->sale_type == SaleType::quotation, 500, 'Cannot change the row state of a quotation');
        
        abort_if(!$saleRow->canSetState($request->state), 500, sprintf('Cannot change the state of the row to "%s"', $request->state));

        $result = DB::transaction(function() use ($request, $saleRow) {
            $saleRow->state = SaleRowState::tryFrom($request->state);
            return $saleRow->save();
        });
        
        return response(null, $result ? 200 : 500);
    }
    

    /**
     * @OA\POST(
     *   tags={"Sales"},
     *   path="/sales/quotation-to-sale",
     *   summary="Convert quotation into an order",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       example={
     *          "quotation_id": "845-10",
     *          "sale_sequence_id": "845-10",
     *          "bp_id": "845-3107",
     *          "currency_id": "EUR",
     *          "order_type_id": "standard",
     *          "delivery_date": "2023-12-10",
     *          "customer_order_ref": "customer order ref",
     *          "order_ref_a": "ref a",
     *          "order_ref_b": "ref b",
     *          "order_ref_c": "ref c",
     *          "destination_address_id": "845-10",
     *          "invoice_address_id": "845-10",
     *          "payment_term_code": "prepayment",
     *          "payment_method_code": "bank_transfer",
     *          "sales_internal_contact_id": "845-100",
     *          "sales_external_contact_id": "845-10",
     *          "carrier_id": "845-31",
     *          "delivery_term_id": "term1",
     *          "sale_rows" : {
     *              {
     *                  "id" : "845-10",
     *                  "position" : 10,
     *                  "item_id" : "845-10",
     *                  "standard_product_id" : "",
     *                  "configuration" : "",
     *                  "quantity": 10,
     *                  "order_type_id" : "standard",
     *                  "customer_order_ref" : "customer order ref",
     *                  "order_ref_a" : "ref a",   
     *                  "order_ref_b" : "ref b",   
     *                  "order_ref_c" : "ref c",
     *                  "destination_address_id" : "845-10",
     *                  "delivery_term_id" : "term1",
     *                  "carrier_id" : "845-30",
     *                  "tax_code" : "",
     *                  "lot_id" : "",
     *                  "delivery_date" :"2023-01-10",
     *                  "sale_note" : "",
     *                  "billing_note" : "",
     *                  "production_note" : "",
     *                  "shipping_note" : "",
     *                  "packaging_note" : "",
     *                  "workcenter_id" : "845-1"
     *              },
     *              {
     *                  "id" : "",
     *                  "position" : 13,
     *                  "item_id" : "845-22",
     *                  "standard_product_id" : "",
     *                  "configuration" : "",
     *                  "quantity": 10,
     *                  "order_type_id" : "standard",
     *                  "customer_order_ref" : "customer order ref",
     *                  "order_ref_a" : "ref a",   
     *                  "order_ref_b" : "ref b",   
     *                  "order_ref_c" : "ref c",
     *                  "destination_address_id" : "845-10",
     *                  "delivery_term_id" : "term1",
     *                  "carrier_id" : "845-30",
     *                  "tax_code" : "",
     *                  "lot_id" : "",
     *                  "delivery_date" :"2023-01-10",
     *                  "sale_note" : "",
     *                  "billing_note" : "",
     *                  "production_note" : "",
     *                  "shipping_note" : "",
     *                  "packaging_note" : "",
     *                  "workcenter_id" : "845-1"
     *              }              
     *          }
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function quotationToSale(ConvertQuotationToSaleRequest $request)
    {
        $quotation = 
            Sale::where('company_id', auth()->user()->IDcompany)
                ->where('id', $request->quotation_id)
                ->firstOrFail();

        $this->authorize('update', $quotation);

        abort_if($quotation->isExpired(), 400, "You cannot convert this quotation into an order because the selected quotation is expired");

        $sale = DB::transaction(function() use ($request){
            $sale = new Sale();
            $sale->fill($request->validated());
            $sale->sale_type = SaleType::sale;
            $sale->company_id = auth()->user()->IDcompany;
            $sale->created_at = now()->format('Y-m-d H:i:s');
            $sale->timezone = auth()->user()->clientTimezoneDB;
            $sale->state = SaleState::inserted;
            $sale->expires_at = null;
            $sale->quotation_id = $request->quotation_id;
            

            if(!$sale->save()){
                abort(500);
            }

            $totalDiscountAutoApproval = auth()->user()->can('approveDiscountOverride', $sale);
            foreach($request->sale_rows as $row){
                if(empty($row['id'])){
                    $row = SaleRow::buildFromSaleRowData(
                        $row,
                        auth()->user(),
                        $request->bp_id
                    );
                }
                else {
                    $row = SaleRow::findOrFail($row['id']);
                    $row = $row->replicate()->forceFill([
                        'sale_id' => $sale->id,
                        'created_at' => now()->format('Y-m-d H:i:s')
                    ]);
                    $row->lockPrices(true);
                }
                $row->totalDiscountAutoApproval($totalDiscountAutoApproval);
                $sale->saleRows()->save($row);
            }

            return $sale;
        });
        
        return $this->show($sale);

    }


    /**
     * @OA\GET(
     *   tags={"Sales"},
     *   path="/sales/{id}/send-template",
     *   summary="Get the sale email template",
     *   @OA\Parameter(
     *     name="id",
     *     required=true,
     *     type="string"
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function sendTemplate(Sale $sale)
    {
        $view = view('emails.sales.sale_pdf', ['sale' => $sale])->render();
        $subject = (new SalePDF($sale))->envelope()->subject;

        return response()->json(['template' => $view, 'subject' => $subject]);
    }


    /**
     * @OA\POST(
     *   tags={"Sales"},
     *   path="/sales/{id}/send",
     *   summary="Send the order by email",
     *   @OA\Parameter(
     *     name="id",
     *     required=true,
     *     type="string"
     *   ),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "subject",
     *          "template",
     *          "to"
     *       },
     *       @OA\Property(property="subject", type="string"),
     *       @OA\Property(property="template", type="string"),
     *       @OA\Property(property="to", type="object"),
     *       example={
     *          "subject": "order #1234",
     *          "template": "## Dear customer  \nthanks for your order",
     *          "to": {"info@inoma.it"}
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function send(SendSalePDFRequest $request, Sale $sale)
    {
        abort_if($sale->is_blocked, 500, 'Cannot send a blocked order by email');

        $cc = [];
        if($sale?->internalContact?->email) {
            $cc[] = $sale?->internalContact?->email;
        }
        if($sale?->externalContact?->email) {
            $cc[] = $sale?->externalContact?->email;
        }
        Mail::to($request->to)
            ->cc($cc)
            ->send(new SalePDF($sale, $request->subject, $request->template));

        return response(null, 200);
    }


    /**
     * @OA\POST(
     *   tags={"Sales"},
     *   path="/sales/get-row-price-preview",
     *   summary="Get the prices preview for a row",
     *    @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "sale_type", "currency_id", "bp_id", "sale_row"
     *       },
     *       @OA\Property(property="sale_type", type="string"),
     *       @OA\Property(property="currency_id", type="string"),
     *       @OA\Property(property="bp_id", type="string"),
     *       @OA\Property(property="sale_row", type="object"),
     *       example={
     *          "sale_type": "quotation",
     *          "bp_id": "845-3107",
     *          "currency_id": "EUR",
     *          "sale_row" : {
     *              "item_id" : "845-10",
     *              "standard_product_id" : "",
     *              "configuration" : "",
     *              "quantity": 10,
     *              "workcenter_id" : "845-1",
     *              "override_total_discount": -10
     *          }
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function getRowPricePreview(SaleRowPricePreviewRequest $request)
    {
        $calculatedRow = null;

        try {
            DB::transaction(function() use ($request, &$calculatedRow) {
                $sale = new Sale();
                $sale->fill($request->validated());
                $sale->company_id = auth()->user()->IDcompany;
                $sale->created_at = now()->format('Y-m-d H:i:s');
                $sale->timezone = auth()->user()->clientTimezoneDB;
                $sale->company_currency_id = auth()->user()->company->curr;
                
                try {
                    $row = SaleRow::buildFromSaleRowData(
                        $request->sale_row,
                        auth()->user(),
                        $request->bp_id
                    );

                    $row->sale = $sale;
                    $row->calculatePrices(false);

                    $calculatedRow = $row;
                }
                catch(ConfiguratorException $e) {
                    abort(500, $e->getMessage());
                }

                throw new \DomainException(); //forcing rollback of the created temporary items
            });
        }
        catch(\DomainException $e) {
        }
        
        $calculatedRow->salePriceComponents->loadMissing([
            'item',
            'process',
            'salePriceList',
            'saleDiscountMatrix'
        ]);
        $calculatedRow->sale_price_components = $calculatedRow->salePriceComponents;

        $calculatedRow->saleRoutingCostComponents->loadMissing([
            'item',
            'process',
            'salePriceList',
            'saleDiscountMatrix'
        ]);
        $calculatedRow->sale_routing_cost_components = $calculatedRow->saleRoutingCostComponents;
        
        $calculatedRow->loadMissing(['saleTotalDiscountMatrixRow']);
        $calculatedRow->sale_total_discount_matrix_row = $calculatedRow->saleTotalDiscountMatrixRow;
        
        return response()->json($calculatedRow);
        
    }


    /** 
     * @OA\Get(
     *   tags={"Sales"},
     *   path="/sales/require-discount-approval",
     *   summary="Get list of quotations and sales that require the total discount approval",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *       ),
     *     )
     *   )
     * )
     */
    public function requireDiscountApproval(Request $request)
    {
        $this->authorize('approveDiscountOverride', Sale::class);

        abort_if(empty($request->columns['sale_type']['search']['value']), 400, "You have to filter by sale type");
        
        abort_if(!in_array($request->columns['sale_type']['search']['value'], collect(SaleType::cases())->pluck('name')->toArray()), 400, "Invalid sale type");
  
        $query = 
            Sale::requireDiscountApproval(auth()->user()->IDcompany)
                ->where('sales.company_id', auth()->user()->IDcompany)
                ->with('bp')
                ->with('internalContact');

        $datatable = new SaleDataTable($query);

        if(!$request->has('order')) {
            $datatable->order(function($query) {
                $query->orderBy('created_at', 'desc');
            });
        }

        return $datatable->toJson();
        
    }


    /** 
     * @OA\Get(
     *   tags={"Sales"},
     *   path="/sales/require-discount-approval-count",
     *   summary="Get count of quotations and sales that require the total discount approval",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="array",
     *       @OA\Property(
     *         type="object",
     *       ),
     *     )
     *   )
     * )
     */
    public function requireDiscountApprovalCount(Request $request)
    {
        $this->authorize('approveDiscountOverride', Sale::class);

        $count = 
            Sale::requireDiscountApproval(auth()->user()->IDcompany)
                ->where('sales.company_id', auth()->user()->IDcompany)
                ->count();

        return response()->json([
            'count' => $count
        ]);
        
    }


    /**
     * @OA\POST(
     *   tags={"Sales"},
     *   path="/sales/{id}/approve-discount",
     *   summary="Approve or deny an override discount on a single row",
     *   @OA\Parameter(
     *     name="id",
     *     required=true,
     *     type="string"
     *   ),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "row_id",
     *          "approve",
     *       },
     *       @OA\Property(property="row_id", type="string"),
     *       @OA\Property(property="approve", type="boolean"),
     *       example={
     *          "row_id": "845-1",
     *          "approve": true,
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *   ),
     *   @OA\Response(response=500, description="Internal Error")
     * )
     */
    public function approveDiscount(ApproveDiscountRequest $request, Sale $sale)
    {
        $this->authorize('approveDiscountOverride', $sale);

        $row = SaleRow::findOrFail($request->row_id);
        if(!$row->override_total_discount_to_approve) {
            abort(400, "No discount to approve");
        }

        if(!$request->approve) {
            $row->override_total_discount = null;
            $row->override_total_discount_note = null;
        }
        $row->override_total_discount_to_approve = false;

        DB::transaction(function() use ($row) {
            if(!$row->save()) {
                abort(500);
            }
        });

        return response(null, 200);
    }

}
