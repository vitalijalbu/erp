<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\SalePriceList;
use App\Models\SalePriceListRow;
use App\Http\Controllers\Controller;
use App\DataTables\SalePriceListRowDataTable;
use App\Http\Requests\ToggleSalePriceListRowRequest;
use App\Http\Requests\StoreUpdateSalePriceListRowRequest;

class SalePriceListRowController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(SalePriceList::class, ['salePriceList', 'salePriceListRow']);
    }
    /**
     * @OA\Get(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists/{id}/rows",
     *   summary="Get sales price lists rows",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SalePriceListRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index(Request $request, SalePriceList $salePriceList)
    {
        $datatable = new SalePriceListRowDataTable(
            SalePriceListRow::query()
                ->where('company_id', auth()->user()->IDcompany)
                ->where('sales_price_list_id', $salePriceList->id)
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
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists/{id}/rows",
     *   summary="Create sales price list row",
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
     *         @OA\Items(ref="#/components/schemas/SalePriceListRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdateSalePriceListRowRequest $request, SalePriceList $salePriceList)
    {
        $salePriceListRow = new SalePriceListRow();
        $salePriceListRow->fill($request->validated());
        $salePriceListRow->company_id = auth()->user()->IDcompany;
        $salePriceListRow->sales_price_list_id = $salePriceList->id;

        if(!$salePriceListRow->save()){
            abort(500);
        }

        return $this->show($salePriceList, $salePriceListRow);
    }

    /**
     * @OA\Get(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists/{id}/rows/{idRow}",
     *   summary="Get details of sales price lists row",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SalePriceListRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(SalePriceList $salePriceList, SalePriceListRow $salePriceListRow)
    {
        $salePriceListRow->loadMissing(['item', 'itemGroup', 'itemSubfamily']);
        
        return response()->json($salePriceListRow);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateSalePriceListRowRequest $request, SalePriceList $salePriceList, SalePriceListRow $salePriceListRow)
    {
        //
    }

    /**
     * @OA\Delete(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists/{id}/rows/{idRow}",
     *   summary="Delete sales price lists row",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SalePriceListRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(SalePriceList $salePriceList, SalePriceListRow $salePriceListRow)
    {
        if(!$salePriceListRow->delete()){
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Sales Price Lists"},
     *   path="/sales-price-lists/{id}/rows/{idRow}/toggle",
     *   summary="Enable/disable sales price list row",
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
     *         @OA\Items(ref="#/components/schemas/SalePriceListRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function toggle(ToggleSalePriceListRowRequest $request, SalePriceList $salePriceList, SalePriceListRow $salePriceListRow)
    {
        $this->authorize('toggle', [$salePriceList, $salePriceListRow]);

        $salePriceListRow->is_disabled = $request->disable;

        if(!$salePriceListRow->save()){
            abort(500);
        }
    }
}
