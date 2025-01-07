<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\SaleDiscountMatrix;
use App\Models\SaleDiscountMatrixRow;
use App\Http\Controllers\Controller;
use App\DataTables\SaleDiscountMatrixRowDataTable;
use App\Http\Requests\ToggleSaleDiscountMatrixRowRequest;
use App\Http\Requests\StoreUpdateSaleDiscountMatrixRowRequest;

class SaleDiscountMatrixRowController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(SaleDiscountMatrix::class, ['saleDiscountMatrix', 'saleDiscountMatrixRow']);
    }
    /**
     * @OA\Get(
     *   tags={"Sales Discount Matrix"},
     *   path="/sales-discount-matrix/{id}/rows",
     *   summary="Get sales discount matrix rows",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleDiscountMatrixRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function index(Request $request, SaleDiscountMatrix $saleDiscountMatrix)
    {
        $datatable = new SaleDiscountMatrixRowDataTable(
            SaleDiscountMatrixRow::query()
                ->where('company_id', auth()->user()->IDcompany)
                ->where('sale_discount_matrix_id', $saleDiscountMatrix->id)
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

        if(!$request->has('position')) {
            $datatable->order(function($query) {
                $query->orderBy('position');
            });
        }

        return $datatable->toJson();
    }

  /**
     * @OA\Post(
     *   tags={"Sales Discount Matrix"},
     *   path="/sales-discount-matrix/{id}/rows",
     *   summary="Create sales discount matrix row",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       type="object",
     *       required={
     *          "position", "value"
     *       },
     *       @OA\Property(property="position", type="integer"),
     *       @OA\Property(property="value", type="float"),
     *       example={
     *          "position" : 1,
     *          "item_id" : "845-10",
     *          "item_group_id" : "",
     *          "item_subfamily_id" : "",
     *          "quantity" : 10,
     *          "value" : "20",
     *          "date_from" : "2024-01-01",
     *          "date_to" : "",
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
     *         @OA\Items(ref="#/components/schemas/SaleDiscountMatrixRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function store(StoreUpdateSaleDiscountMatrixRowRequest $request, SaleDiscountMatrix $saleDiscountMatrix)
    {
        $saleDiscountMatrixRow = new SaleDiscountMatrixRow();
        $saleDiscountMatrixRow->fill($request->validated());
        $saleDiscountMatrixRow->company_id = auth()->user()->IDcompany;
        $saleDiscountMatrixRow->sale_discount_matrix_id = $saleDiscountMatrix->id;

        if(!$saleDiscountMatrixRow->save()){
            abort(500);
        }

        return $this->show($saleDiscountMatrix, $saleDiscountMatrixRow);
    }

    /**
     * @OA\Get(
     *   tags={"Sales Discount Matrix"},
     *   path="/sales-discount-matrix/{id}/rows/{idRow}",
     *   summary="Get details of sales discount matrix row",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleDiscountMatrixRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function show(SaleDiscountMatrix $saleDiscountMatrix, SaleDiscountMatrixRow $saleDiscountMatrixRow)
    {
        $saleDiscountMatrixRow->loadMissing(['item', 'itemGroup', 'itemSubfamily']);
        
        return response()->json($saleDiscountMatrixRow);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateSaleDiscountMatrixRowRequest $request, SaleDiscountMatrix $saleDiscountMatrix, SaleDiscountMatrixRow $saleDiscountMatrixRow)
    {
        //
    }

    /**
     * @OA\Delete(
     *   tags={"Sales Discount Matrix"},
     *   path="/sales-discount-matrix/{id}/rows/{idRow}",
     *   summary="Delete sales discount matrix row",
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/SaleDiscountMatrixRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function destroy(SaleDiscountMatrix $saleDiscountMatrix, SaleDiscountMatrixRow $saleDiscountMatrixRow)
    {
        if(!$saleDiscountMatrixRow->delete()){
            abort(500);
        }
    }

    /**
     * @OA\Put(
     *   tags={"Sales Discount Matrix"},
     *   path="/sales-discount-matrix/{id}/rows/{idRow}/toggle",
     *   summary="Enable/disable sales discount matrix row",
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
     *         @OA\Items(ref="#/components/schemas/SaleDiscountMatrixRowResource")
     *       ),
     *     )
     *   )
     * )
     */
    public function toggle(ToggleSaleDiscountMatrixRowRequest $request, SaleDiscountMatrix $saleDiscountMatrix, SaleDiscountMatrixRow $saleDiscountMatrixRow)
    {
        $this->authorize('toggle', [$saleDiscountMatrix, $saleDiscountMatrixRow]);

        $saleDiscountMatrixRow->is_disabled = $request->disable;

        if(!$saleDiscountMatrixRow->save()){
            abort(500);
        }
    }
}
