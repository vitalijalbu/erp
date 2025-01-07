<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\PurchasePriceList;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\DataTables\PurchasePriceListDataTable;
use App\Http\Requests\ClonePurchasePriceListRequest;
use App\Http\Requests\TogglePurchasePriceListRequest;
use App\Http\Requests\StoreUpdatePurchasePriceListRequest;
use App\Http\Requests\ChangePricePurchasePriceListRowRequest;

class PurchasePriceListController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(PurchasePriceList::class, 'purchasePriceList');
    }
    /**
     * @OA\Get(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists",
     *   summary="Get purchase price lists",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new PurchasePriceListDataTable(
            PurchasePriceList::query()
                ->select('*', 'purchase_price_lists.currency_id')
                ->where('company_id', auth()->user()->IDcompany)
                ->with(['bp' => function($q){
                    $q->select('IDbp', 'desc');
                }])
        );

        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists",
     *   summary="Create purchase price list",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "code", "currency_id"
     *       },
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="currency", type="string"),
     *       example={
     *          "code" : "purchase_price_list_eur",
     *          "currency_id" : "EUR",
     *          "bp_id" : "",
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdatePurchasePriceListRequest $request)
    {
        $purchasePriceList = new PurchasePriceList();
        $purchasePriceList->fill($request->validated());
        $purchasePriceList->company_id = auth()->user()->IDcompany;


        if(!$purchasePriceList->save()){
            abort(500);
        }

        return $this->show($purchasePriceList);
    }

    /**
     * @OA\Get(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists/{id}",
     *   summary="Get details of purchase price list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(PurchasePriceList $purchasePriceList)
    {
        $purchasePriceList->loadMissing(['bp', 'currency', 'rows']);
        
        return response()->json($purchasePriceList);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdatePurchasePriceListRequest $request, PurchasePriceList $purchasePriceList)
    {
        //
    }

    /**
     * @OA\Delete(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists/{id}",
     *   summary="Delete purchase price list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(PurchasePriceList $purchasePriceList)
    {
        if(!$purchasePriceList->rows->isEmpty()){
            abort(400, "You cannot delete the purchase price list because there are associated rows");
        }
        
        if(!$purchasePriceList->delete()){
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists/{id}/toggle",
     *   summary="Enable/disable purchase price list",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "disable"
     *       },
     *       @OA\Property(property="disable", type="boolean"),
     *       example={
     *          "disable" : true
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function toggle(TogglePurchasePriceListRequest $request, PurchasePriceList $purchasePriceList)
    {
        $this->authorize('toggle', $purchasePriceList);

        $purchasePriceList->is_disabled = $request->disable;

        if(!$purchasePriceList->save()){
            abort(500);
        }
    }

    /**
     * @OA\Post(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists/{id}/clone",
     *   summary="Clone purchase price list",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "code", "currency_id"
     *       },
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="currency_id", type="string"),
     *       example={
     *          "code" : "clone_test_usd",
     *          "currency_id" : "USD",
     *          "bp_id" : "",
     *          "price_change" : -30,
     *          "rows" : {
     *              {
     *                  "item_group_id" : "845-10",
     *                  "price_change" : 90
     *              }
     *          }
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function clone(ClonePurchasePriceListRequest $request, PurchasePriceList $purchasePriceList)
    {
        $this->authorize('clone', $purchasePriceList);

        $clone = 
            DB::transaction(function() use ($purchasePriceList, $request){
                return $purchasePriceList->clone($request->validated());
            });

        return $this->show($clone);
    }

    /**
     * @OA\Put(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists/{id}/change-prices",
     *   summary="Change prices in purchase price list",
     *   @OA\RequestBody(
     *     @OA\JsonContent(
     *       type="object",
     *       example={
     *          "price_change" : -30,
     *          "rows" : {
     *              {
     *                  "item_group_id" : "845-10",
     *                  "price_change" : 90
     *              }
     *          }
     *       }
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function changePrice(ChangePricePurchasePriceListRowRequest $request, PurchasePriceList $purchasePriceList)
    {
        $this->authorize('changePrice', $purchasePriceList);

        DB::transaction(function() use ($purchasePriceList, $request){
            $purchasePriceList->changePrice($request->validated());
        });

    }
}
