<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\SalePriceList;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\DataTables\SalePriceListDataTable;
use App\Http\Requests\CloneSalePriceListRequest;
use App\Http\Requests\ToggleSalePriceListRequest;
use App\Http\Requests\StoreUpdateSalePriceListRequest;
use App\Http\Requests\ChangePriceSalePriceListRowRequest;

class SalePriceListController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(SalePriceList::class, 'salePriceList');
    }
    /**
     * @OA\Get(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists",
     *   summary="Get sales price lists",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SalePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index()
    {
        $datatable = new SalePriceListDataTable(
            SalePriceList::query()
                ->select('*', 'sales_price_lists.currency_id')
                ->where('company_id', auth()->user()->IDcompany)
                ->with(['bp' => function($q){
                    $q->select('IDbp', 'desc');
                }])
        );

        return $datatable->toJson();
    }

    /**
     * @OA\Post(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists",
     *   summary="Create sales price list",
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
     *          "code" : "sales_price_list_eur",
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
     *         @OA\Items(ref="#/components/schemas/SalePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdateSalePriceListRequest $request)
    {
        $salePriceList = new SalePriceList();
        $salePriceList->fill($request->validated());
        $salePriceList->company_id = auth()->user()->IDcompany;


        if(!$salePriceList->save()){
            abort(500);
        }

        return $this->show($salePriceList);
    }

    /**
     * @OA\Get(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists/{id}",
     *   summary="Get details of sales price list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SalePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(SalePriceList $salePriceList)
    {
        $salePriceList->loadMissing(['bp', 'currency', 'rows']);
        
        return response()->json($salePriceList);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateSalePriceListRequest $request, SalePriceList $salePriceList)
    {
        //
    }

    /**
     * @OA\Delete(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists/{id}",
     *   summary="Delete sales price list",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SalePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(SalePriceList $salePriceList)
    {
        if(!$salePriceList->rows->isEmpty()){
            abort(400, "You cannot delete the sales price list because there are associated rows");
        }
        
        if(!$salePriceList->delete()){
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists/{id}/toggle",
     *   summary="Enable/disable sales price list",
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
     *         @OA\Items(ref="#/components/schemas/SalePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function toggle(ToggleSalePriceListRequest $request, SalePriceList $salePriceList)
    {
        $this->authorize('toggle', $salePriceList);

        $salePriceList->is_disabled = $request->disable;

        if(!$salePriceList->save()){
            abort(500);
        }
    }

    /**
     * @OA\Post(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists/{id}/clone",
     *   summary="Clone sales price list",
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
     *         @OA\Items(ref="#/components/schemas/SalePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function clone(CloneSalePriceListRequest $request, SalePriceList $salePriceList)
    {
        $this->authorize('clone', $salePriceList);

        $clone = 
            DB::transaction(function() use ($salePriceList, $request){
                return $salePriceList->clone($request->validated());
            });

        return $this->show($clone);
    }

    /**
     * @OA\Put(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists/{id}/change-prices",
     *   summary="Change prices in sales price list",
     *   @OA\RequestBody(
     *     required=true,
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
     *         @OA\Items(ref="#/components/schemas/SalePriceListResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function changePrice(ChangePriceSalePriceListRowRequest $request, SalePriceList $salePriceList)
    {
        $this->authorize('changePrice', $salePriceList);

        DB::transaction(function() use ($salePriceList, $request){
            $salePriceList->changePrice($request->validated());
        });

    }
}
