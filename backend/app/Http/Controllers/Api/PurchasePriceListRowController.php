<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\PurchasePriceList;
use App\Models\PurchasePriceListRow;
use App\Http\Controllers\Controller;
use App\DataTables\PurchasePriceListRowDataTable;
use App\Http\Requests\TogglePurchasePriceListRowRequest;
use App\Http\Requests\StoreUpdatePurchasePriceListRowRequest;

class PurchasePriceListRowController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(PurchasePriceList::class, ['purchasePriceList', 'purchasePriceListRow']);
    }
    /**
     * @OA\Get(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists/{id}/rows",
     *   summary="Get purchase price lists rows",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index(Request $request, PurchasePriceList $purchasePriceList)
    {
        $datatable = new PurchasePriceListRowDataTable(
            PurchasePriceListRow::query()
                ->where('company_id', auth()->user()->IDcompany)
                ->where('purchase_price_list_id', $purchasePriceList->id)
                ->with(['item' => function($q){
                    $q->select('IDitem', 'item', 'item_desc');
                }])
                ->with(['itemGroup' => function($q){
                    $q->select('id', 'item_group', 'group_desc');
                }])
                ->with(['itemSubfamily' => function($q){
                    $q->select('id', 'code', 'description');
                }])
        );

        if(!$request->has('order')) {
            $datatable->order(function($query) {
                $query->orderBy('order');
            });
        }

        return $datatable->toJson();
    }

  /**
     * @OA\Post(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists/{id}/rows",
     *   summary="Create purchase price list row",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "order", "price"
     *       },
     *       @OA\Property(property="order", type="integer"),
     *       @OA\Property(property="price", type="float"),
     *       example={
     *          "order" : 1,
     *          "item_id" : "845-10",
     *          "item_group_id" : "",
     *          "item_subfamily_id" : "",
     *          "quantity" : 10,
     *          "width" : "",
     *          "class" : "",
     *          "date_from" : "2024-01-01",
     *          "date_to" : "",
     *          "price" : 15,
     *          "note" : "",
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
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdatePurchasePriceListRowRequest $request, PurchasePriceList $purchasePriceList)
    {
        $purchasePriceListRow = new PurchasePriceListRow();
        $purchasePriceListRow->fill($request->validated());
        $purchasePriceListRow->company_id = auth()->user()->IDcompany;
        $purchasePriceListRow->purchase_price_list_id = $purchasePriceList->id;

        if(!$purchasePriceListRow->save()){
            abort(500);
        }

        return $this->show($purchasePriceList, $purchasePriceListRow);
    }

    /**
     * @OA\Get(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists/{id}/rows/{idRow}",
     *   summary="Get details of purchase price lists row",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(PurchasePriceList $purchasePriceList, PurchasePriceListRow $purchasePriceListRow)
    {
        $purchasePriceListRow->loadMissing(['item', 'itemGroup', 'itemSubfamily']);
        
        return response()->json($purchasePriceListRow);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdatePurchasePriceListRowRequest $request, PurchasePriceList $purchasePriceList, PurchasePriceListRow $purchasePriceListRow)
    {
        //
    }

    /**
     * @OA\Delete(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists/{id}/rows/{idRow}",
     *   summary="Delete purchase price lists row",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(PurchasePriceList $purchasePriceList, PurchasePriceListRow $purchasePriceListRow)
    {
        if(!$purchasePriceListRow->delete()){
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Purchase Price Lists"},
     *   path="/purchase-price-lists/{id}/rows/{idRow}/toggle",
     *   summary="Enable/disable purchase price list row",
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
     *         @OA\Items(ref="#/components/schemas/PurchasePriceListRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function toggle(TogglePurchasePriceListRowRequest $request, PurchasePriceList $purchasePriceList, PurchasePriceListRow $purchasePriceListRow)
    {
        $this->authorize('toggle', [$purchasePriceList, $purchasePriceListRow]);

        $purchasePriceListRow->is_disabled = $request->disable;

        if(!$purchasePriceListRow->save()){
            abort(500);
        }
    }
}
